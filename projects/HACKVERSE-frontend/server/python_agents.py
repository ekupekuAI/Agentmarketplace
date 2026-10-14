import csv
import io
import json
import re
import sys
from collections import Counter


def words(text):
    return re.findall(r"[A-Za-z0-9_'-]+", text)


def document_analyzer(input_data):
    text = input_data.get("document", "")
    tokens = words(text)
    sentences = [item.strip() for item in re.split(r"[.!?]\s+", text) if item.strip()]
    common = [word for word, _ in Counter(word.lower() for word in tokens if len(word) > 4).most_common(8)]
    actions = [line.strip("-* 	") for line in text.splitlines() if re.search(r"\b(todo|action|required|must|next|owner)\b", line, re.I)]
    return {
        "summary": f"Document analyzed: {len(tokens)} words, {len(sentences)} sentence blocks, {len(actions)} action-oriented lines.",
        "output": {
            "Word Count": len(tokens),
            "Section Estimate": max(1, len([line for line in text.splitlines() if line.strip() and len(line.strip()) < 80])),
            "Key Terms": common,
            "Action Items": actions[:8] or ["No explicit action items detected."],
            "Executive Brief": " ".join(sentences[:3])[:600],
        },
    }


def csv_analyzer(input_data):
    raw = input_data.get("csv", "")
    rows = list(csv.DictReader(io.StringIO(raw)))
    columns = rows[0].keys() if rows else []
    columns = list(columns)
    # Flatten to strings: the web result panel renders strings and string lists, not nested dicts.
    missing = [f"{column}: {sum(1 for row in rows if not (row.get(column) or '').strip())}" for column in columns]
    numeric = []
    for column in columns:
        values = []
        for row in rows:
            try:
                values.append(float(row.get(column) or ""))
            except ValueError:
                pass
        if values:
            numeric.append(f"{column}: min {min(values):g}, max {max(values):g}, avg {round(sum(values) / len(values), 2):g}")
    return {
        "summary": f"CSV analyzed: {len(rows)} rows across {len(columns)} columns.",
        "output": {
            "Rows": len(rows),
            "Columns": columns,
            "Missing Values": missing,
            "Numeric Summary": numeric or ["No numeric columns detected."],
            "Data Quality": "Ready for review" if rows else "No tabular rows detected",
        },
    }


def image_ocr(input_data):
    text = input_data.get("imageText", "")
    cleaned = re.sub(r"\s+", " ", text).strip()
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    emails = re.findall(r"[\w.-]+@[\w.-]+\.\w+", text)
    urls = re.findall(r"https?://\S+", text)
    return {
        "summary": f"OCR capture processed: {len(cleaned)} characters and {len(lines)} text lines.",
        "output": {
            "Extracted Text": cleaned[:1200],
            "Line Count": len(lines),
            "Detected Emails": emails,
            "Detected URLs": urls,
            "Confidence Note": "Text was parsed from the submitted OCR capture.",
        },
    }


def main():
    payload = json.loads(sys.stdin.buffer.read().decode("utf-8") or "{}")
    agent_id = payload.get("agentId")
    input_data = payload.get("input", {})
    handlers = {
        "document-analyzer": document_analyzer,
        "csv-data-analyzer": csv_analyzer,
        "image-ocr": image_ocr,
    }
    handler = handlers.get(agent_id)
    if handler is None:
        raise SystemExit(2)
    print(json.dumps(handler(input_data)))


if __name__ == "__main__":
    main()
