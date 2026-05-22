"""Tests for CORS origin parsing."""

from main import DEFAULT_CORS_ORIGINS, parse_cors_origins, trim_trailing_slashes


def test_trim_trailing_slashes() -> None:
    assert trim_trailing_slashes("https://example.com///") == "https://example.com"


def test_parse_cors_origins_splits_and_trims() -> None:
    origins = parse_cors_origins(" https://a.com/ , https://b.com ")
    assert origins == ["https://a.com", "https://b.com"]


def test_default_cors_origin_is_https() -> None:
    assert DEFAULT_CORS_ORIGINS.startswith("https://")
