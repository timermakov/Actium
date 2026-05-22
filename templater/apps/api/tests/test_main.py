"""Unit tests for Actium AI Backend API."""

from __future__ import annotations

import os
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

import main


@pytest.fixture
def client() -> TestClient:
    return TestClient(main.app)


@pytest.fixture
def env_credentials(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GIGACHAT_CREDENTIALS", "test-credentials")


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "ai-backend"}


def test_metrics(client: TestClient) -> None:
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "http_requests_total" in response.text


def test_summary_preflight(client: TestClient) -> None:
    response = client.options("/ai/summary")
    assert response.status_code == 204


def test_advice_preflight(client: TestClient) -> None:
    response = client.options("/ai/advice")
    assert response.status_code == 204


def test_generate_summary_empty_dataset(client: TestClient) -> None:
    response = client.post(
        "/ai/summary",
        json={"columns": [], "row_count": 0},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Empty dataset."


def test_generate_advice_missing_template_fields(client: TestClient) -> None:
    response = client.post(
        "/ai/advice",
        json={"template_fields": []},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Template fields are missing."


def test_get_client_missing_credentials(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("GIGACHAT_CREDENTIALS", raising=False)
    with pytest.raises(HTTPException) as exc_info:
        main.get_client()
    assert exc_info.value.status_code == 500
    assert "GIGACHAT_CREDENTIALS is missing" in exc_info.value.detail


@patch("main.GigaChat")
def test_get_client_returns_instance(mock_gigachat: MagicMock, env_credentials: None) -> None:
    mock_gigachat.return_value = MagicMock()
    client = main.get_client()
    assert client is not None
    mock_gigachat.assert_called_once()


@patch("main.get_client")
def test_generate_summary_success(
    mock_get_client: MagicMock,
    client: TestClient,
    env_credentials: None,
) -> None:
    mock_response = MagicMock()
    mock_response.content = "- Good data quality\n- Few empty cells"
    mock_get_client.return_value.invoke.return_value = mock_response

    response = client.post(
        "/ai/summary",
        json={
            "columns": ["name", "email"],
            "row_count": 10,
            "sample_rows": [{"name": "John", "email": "john@example.com"}],
            "empty_cells": 1,
            "empty_rows": 0,
            "duplicate_rows": 0,
            "language": "ru",
        },
    )

    assert response.status_code == 200
    assert "Good data quality" in response.json()["content"]
    mock_get_client.return_value.invoke.assert_called_once()


@patch("main.get_client")
def test_generate_summary_english(
    mock_get_client: MagicMock,
    client: TestClient,
    env_credentials: None,
) -> None:
    mock_response = MagicMock()
    mock_response.content = "Summary in English"
    mock_get_client.return_value.invoke.return_value = mock_response

    response = client.post(
        "/ai/summary",
        json={
            "columns": ["id"],
            "row_count": 5,
            "language": "en",
        },
    )

    assert response.status_code == 200
    prompt = mock_get_client.return_value.invoke.call_args[0][0]
    assert "English" in prompt


@patch("main.get_client")
def test_generate_summary_ai_failure(
    mock_get_client: MagicMock,
    client: TestClient,
    env_credentials: None,
) -> None:
    mock_get_client.return_value.invoke.side_effect = RuntimeError("AI service unavailable")

    response = client.post(
        "/ai/summary",
        json={
            "columns": ["name"],
            "row_count": 3,
            "language": "ru",
        },
    )

    assert response.status_code == 500
    assert "AI request failed" in response.json()["detail"]


@patch("main.get_client")
def test_generate_advice_success(
    mock_get_client: MagicMock,
    client: TestClient,
    env_credentials: None,
) -> None:
    mock_response = MagicMock()
    mock_response.content = "- Map all template fields\n- Check column names"
    mock_get_client.return_value.invoke.return_value = mock_response

    response = client.post(
        "/ai/advice",
        json={
            "template_fields": ["client_name", "date"],
            "columns": ["name", "created_at"],
            "mapping": {"client_name": "name"},
            "unmapped_fields": ["date"],
            "row_count": 20,
            "language": "ru",
        },
    )

    assert response.status_code == 200
    assert "Map all template fields" in response.json()["content"]


@patch("main.get_client")
def test_generate_advice_string_response(
    mock_get_client: MagicMock,
    client: TestClient,
    env_credentials: None,
) -> None:
    mock_get_client.return_value.invoke.return_value = "Plain string advice"

    response = client.post(
        "/ai/advice",
        json={
            "template_fields": ["field1"],
            "columns": ["col1"],
            "language": "en",
        },
    )

    assert response.status_code == 200
    assert response.json()["content"] == "Plain string advice"


@patch("main.get_client")
def test_generate_advice_ai_failure(
    mock_get_client: MagicMock,
    client: TestClient,
    env_credentials: None,
) -> None:
    mock_get_client.return_value.invoke.side_effect = ValueError("Invalid model")

    response = client.post(
        "/ai/advice",
        json={
            "template_fields": ["field1"],
            "columns": ["col1"],
            "language": "ru",
        },
    )

    assert response.status_code == 500
    assert "AI request failed" in response.json()["detail"]
