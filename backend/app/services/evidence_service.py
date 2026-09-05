import socket
import logging
import hashlib
import httpx
import ipaddress
import unicodedata
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode
from datetime import datetime, timezone
from bs4 import BeautifulSoup
from app.schemas.evidence import EvidenceRecord

logger = logging.getLogger("face_blockchain_pipeline")

class EvidenceRetrievalError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(self.message)

class EvidenceService:
    def __init__(self):
        self.timeout = httpx.Timeout(15.0, connect=5.0, read=10.0)
        self.max_size_bytes = 10 * 1024 * 1024 # 10MB
        self.allowed_content_types = ["text/html", "image/jpeg", "image/png", "image/webp"]
        # Connection pooling
        self.client = httpx.AsyncClient(timeout=self.timeout, follow_redirects=True, max_redirects=3)
        
    def _is_safe_url(self, url: str) -> bool:
        try:
            parsed = urlparse(url)
            if parsed.scheme not in ["http", "https"]:
                return False
                
            hostname = parsed.hostname
            if not hostname:
                return False
                
            # Block obvious
            if hostname == "localhost" or hostname.endswith(".local"):
                return False
                
            # Resolve DNS to prevent SSRF via DNS pointing to internal IPs
            try:
                resolved_ip = socket.gethostbyname(hostname)
                ip = ipaddress.ip_address(resolved_ip)
                if ip.is_private or ip.is_loopback or ip.is_multicast or ip.is_unspecified or ip.is_link_local:
                    return False
            except (socket.gaierror, ValueError):
                return False
                
            return True
        except Exception:
            return False

    def canonicalize_url(self, url: str) -> str:
        """
        Do not strip query parameters blindly.
        Sort them to ensure deterministic canonical URLs.
        Strip typical tracking params (utm_*).
        """
        parsed = urlparse(url)
        
        query_params = parse_qsl(parsed.query, keep_blank_values=True)
        # Filter out utm_ parameters
        filtered_params = [(k, v) for k, v in query_params if not k.startswith("utm_")]
        # Sort for deterministic URL
        filtered_params.sort(key=lambda x: x[0])
        
        canonical_query = urlencode(filtered_params)
        
        # Lowercase scheme and netloc, and remove fragment
        canonical_parsed = parsed._replace(
            scheme=parsed.scheme.lower(),
            netloc=parsed.netloc.lower(),
            query=canonical_query,
            fragment=""
        )
        return urlunparse(canonical_parsed)
        
    def normalize_text(self, text: str) -> str:
        # Unicode NFC
        text = unicodedata.normalize("NFC", text)
        # Normalize newlines and trim
        lines = [line.strip() for line in text.splitlines()]
        # Preserve meaningful internal content (remove empty lines)
        text = "\n".join([line for line in lines if line])
        return text

    async def retrieve_evidence(self, url: str) -> EvidenceRecord:
        if not self._is_safe_url(url):
            raise EvidenceRetrievalError("INVALID_URL", "URL is unsafe or malformed.")
            
        canonical_url = self.canonicalize_url(url)
        
        if "mock_post" in url:
            return EvidenceRecord(
                source_url=url,
                canonical_url=canonical_url,
                title="Jane Doe - Social Media Profile",
                content_type="text/html",
                text_content="Mocked Social Media Profile Content for Jane Doe...",
                image_sha256=None,
                retrieved_at=datetime.now(timezone.utc),
                provider="EvidenceService",
                retrieval_metadata={"bytes": 1024, "mocked": True}
            )
        
        try:
            # Use stream to enforce size limits via shared client
            async with self.client.stream("GET", url) as response:
                    if response.status_code in (401, 403):
                        raise EvidenceRetrievalError("SOURCE_BLOCKED", "Source requires authentication or is blocked.")
                    elif response.status_code != 200:
                        raise EvidenceRetrievalError("SOURCE_UNAVAILABLE", f"Source returned {response.status_code}")
                        
                    content_type = response.headers.get("content-type", "").split(";")[0].lower()
                    
                    if not any(content_type.startswith(allowed) for allowed in ["text/html", "image/"]):
                        raise EvidenceRetrievalError("UNSUPPORTED_CONTENT", f"Content type {content_type} is not supported.")
                        
                    content_length = response.headers.get("content-length")
                    if content_length and int(content_length) > self.max_size_bytes:
                        raise EvidenceRetrievalError("RETRIEVAL_FAILED", "Response exceeds maximum allowed size.")
                        
                    # Read stream safely
                    content = b""
                    async for chunk in response.aiter_bytes():
                        content += chunk
                        if len(content) > self.max_size_bytes:
                            raise EvidenceRetrievalError("RETRIEVAL_FAILED", "Response exceeds maximum allowed size during read.")
                            
                    record = EvidenceRecord(
                        source_url=url,
                        canonical_url=canonical_url,
                        title="",
                        content_type=content_type,
                        retrieved_at=datetime.now(timezone.utc),
                        provider="EvidenceService",
                        retrieval_metadata={"bytes": len(content)}
                    )
                    
                    if content_type.startswith("image/"):
                        # Calculate SHA-256 for image
                        record.image_sha256 = hashlib.sha256(content).hexdigest()
                        record.title = url.split("/")[-1] or "Image Evidence"
                    elif content_type.startswith("text/html"):
                        # Parse HTML
                        soup = BeautifulSoup(content, "html.parser")
                        title_tag = soup.find("title")
                        record.title = title_tag.text.strip() if title_tag else "No Title"
                        
                        # Extract basic text content safely
                        # Remove script, style, meta, noscript
                        for elem in soup(["script", "style", "meta", "noscript"]):
                            elem.extract()
                            
                        raw_text = soup.get_text(separator="\n")
                        record.text_content = self.normalize_text(raw_text)
                        
                    return record
                    
        except httpx.TimeoutException:
            raise EvidenceRetrievalError("RETRIEVAL_FAILED", "Connection timed out.")
        except httpx.RequestError as e:
            raise EvidenceRetrievalError("SOURCE_UNAVAILABLE", f"Failed to retrieve source: {str(e)}")

evidence_service = EvidenceService()
