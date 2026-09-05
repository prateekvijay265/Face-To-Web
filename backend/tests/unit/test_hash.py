import pytest
from app.services.canonicalizer import canonicalizer
from app.services.hash_service import hash_service

def test_a_insertion_order():
    # Canonicalizer generates deterministic JSON regardless of kwargs passing order
    # Because kwargs are fundamentally ordered by call in python, we can just assert
    # the JSON string itself has sorted keys.
    json_bytes = canonicalizer.canonicalize(
        source_url="http://a",
        title="b",
        text_content="c",
        image_sha256="d"
    )
    
    # Expected keys in alphabetical order:
    # image_sha256, schema_version, source_url, text, title
    expected = b'{"image_sha256":"d","schema_version":"1.0","source_url":"http://a","text":"c","title":"b"}'
    assert json_bytes == expected

def test_b_crlf_vs_lf():
    hash1 = hash_service.generate_evidence_hash(
        source_url="http://a", title="b", text_content="line1\r\nline2", image_sha256=None
    ).evidence_hash
    
    hash2 = hash_service.generate_evidence_hash(
        source_url="http://a", title="b", text_content="line1\nline2", image_sha256=None
    ).evidence_hash
    
    assert hash1 == hash2

def test_c_one_character_changed():
    hash1 = hash_service.generate_evidence_hash(
        source_url="http://a", title="b", text_content="c", image_sha256=None
    ).evidence_hash
    
    hash2 = hash_service.generate_evidence_hash(
        source_url="http://a", title="b", text_content="d", image_sha256=None
    ).evidence_hash
    
    assert hash1 != hash2

def test_d_image_byte_changed():
    hash1 = hash_service.generate_evidence_hash(
        source_url="http://a", title="b", text_content=None, image_sha256="000"
    ).evidence_hash
    
    hash2 = hash_service.generate_evidence_hash(
        source_url="http://a", title="b", text_content=None, image_sha256="001"
    ).evidence_hash
    
    assert hash1 != hash2

def test_e_canonicalization_version_changed():
    # If we modify the version explicitly, it should change the hash
    original_version = canonicalizer.version
    
    hash1 = hash_service.generate_evidence_hash(
        source_url="http://a", title="b", text_content="c", image_sha256=None
    ).evidence_hash
    
    canonicalizer.version = "1.1"
    hash2 = hash_service.generate_evidence_hash(
        source_url="http://a", title="b", text_content="c", image_sha256=None
    ).evidence_hash
    
    canonicalizer.version = original_version
    
    assert hash1 != hash2

def test_f_unicode_normalization():
    # u00E9 is "é"
    # u0065 u0301 is "e" + acute accent
    str1 = "\u00E9"
    str2 = "\u0065\u0301"
    
    assert str1 != str2 # verify they are different in python naturally
    
    hash1 = hash_service.generate_evidence_hash(
        source_url="http://a", title="b", text_content=str1, image_sha256=None
    ).evidence_hash
    
    hash2 = hash_service.generate_evidence_hash(
        source_url="http://a", title="b", text_content=str2, image_sha256=None
    ).evidence_hash
    
    assert hash1 == hash2
