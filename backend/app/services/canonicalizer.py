import json
import unicodedata
from typing import Optional

class Canonicalizer:
    def __init__(self, version: str = "1.0"):
        self.version = version

    def normalize_text(self, text: Optional[str]) -> Optional[str]:
        if text is None:
            return None
            
        # Unicode NFC
        text = unicodedata.normalize("NFC", text)
        # Normalize line endings to LF
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        # Trim leading/trailing whitespace
        text = text.strip()
        
        return text

    def canonicalize(
        self,
        source_url: str,
        title: str,
        text_content: Optional[str],
        image_sha256: Optional[str]
    ) -> bytes:
        """
        Creates a deterministic canonical JSON byte representation.
        """
        
        # Explicitly define missing behavior: if missing, use None (which becomes null in JSON)
        canonical_obj = {
            "schema_version": self.version,
            "source_url": self.normalize_text(source_url),
            "title": self.normalize_text(title),
            "text": self.normalize_text(text_content),
            "image_sha256": image_sha256 if image_sha256 else None
        }
        
        # Serialize with deterministic rules:
        # - UTF-8
        # - ensure_ascii=False (to keep raw unicode characters instead of \uXXXX)
        # - sort_keys=True
        # - separators=(',', ':') (no spaces)
        canonical_str = json.dumps(
            canonical_obj,
            ensure_ascii=False,
            sort_keys=True,
            separators=(',', ':')
        )
        
        return canonical_str.encode("utf-8")

canonicalizer = Canonicalizer(version="1.0")
