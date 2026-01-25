# Functional Requirements (FR) — v0.1.1

## FR-7 AI Summary

- System SHALL provide a data summary based on uploaded CSV/XLSX.
- Summary SHALL be generated via the backend AI endpoint `/ai/summary`.
- Summary SHALL be displayed in the UI in a readable format.

## FR-8 AI Mapping Advisor

- System SHALL provide mapping advice based on template fields and data columns.
- Advice SHALL be generated via the backend AI endpoint `/ai/advice`.
- Advice SHALL be displayed in the UI in a readable format.

## FR-9 Data Quality Insights

- System SHALL display total rows and columns.
- System SHALL show counts of empty cells, empty rows, and duplicate rows.

## FR-10 Mapping Health

- System SHALL display the percentage of mapped template fields.
- System SHALL list unmapped template fields when present.

## FR-11 Smart Default Mapping

- System SHALL auto-map template fields to data columns when names match (case-insensitive).
- Auto-mapping SHALL NOT override user-selected mappings.
