# Functional Requirements (FR) — Step 1 (v0.1.0)

## FR-1 Template Input

### FR-1.1 DOCX Template Upload

- User SHALL upload a `.docx` file.
- Template MUST contain text placeholders in the form `{{field_name}}`.

Examples:

```
{{debtor_name}}
{{debt_amount}}
{{address}}
```

### FR-1.2 Template Field Detection

- System SHALL scan the DOCX file.
- System SHALL extract all unique placeholders.
- Extracted fields SHALL be displayed as a list.

---

## FR-2 Data Input

### FR-2.1 CSV / XLSX Upload

- User SHALL upload one data file: `.csv` or `.xlsx`.
- First row MUST be column headers.

### FR-2.2 Data Parsing

- System SHALL parse column names and rows.
- System SHALL show a preview of the first N rows (default 10).

---

## FR-3 Field Mapping (2-Column Approach)

### FR-3.1 Mapping UI

- System SHALL display a table with two columns:

| Template Field | Data Column |
| -------------- | ----------- |

- Each Template Field SHALL have a dropdown.
- Dropdown options = CSV/XLSX column names.

### FR-3.2 Mapping Rules

- All template fields MUST be mapped.
- One data column MAY be mapped to multiple template fields.
- Mapping MUST be validated before generation.

### FR-3.3 Mapping Persistence (Minimal)

- User SHALL be able to export mapping as JSON.
- User SHALL be able to import mapping from JSON.

---

## FR-4 Document Generation

### FR-4.1 Single Document Generation

- User SHALL select one row from data preview.
- System SHALL replace placeholders with row values.
- System SHALL generate one filled DOCX.
- User SHALL download the DOCX file.

### FR-4.2 Batch Document Generation

- User SHALL generate documents for all rows.
- System SHALL generate one DOCX per row.
- System SHALL package all DOCX files into a ZIP.
- User SHALL download the ZIP.

---

## FR-5 Output Rules

### FR-5.1 Output Format

- Output format = DOCX only.
- No PDF.
- No merge into one document.

### FR-5.2 File Naming

- Filenames SHALL include mapped values, e.g. `debtor_name_debt_amount.docx`.
- Fallback: `document_001.docx`.

---

## FR-6 Errors & Validation

### FR-6.1 Validation Errors

- Missing mappings → block generation.
- Invalid file types → block upload.
- Empty required fields → warn but allow generation.

### FR-6.2 Batch Errors

- If one row fails: continue batch and report failed rows at the end.
