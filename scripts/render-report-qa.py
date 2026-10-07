"""Render the real browser-export PDF for visual and text-boundary checks."""
from pathlib import Path
import sys
import json
import re
import pdfplumber

root = Path(__file__).resolve().parents[1]
qa = root / ".qa" / "report"
qa.mkdir(parents=True, exist_ok=True)
with pdfplumber.open(sys.argv[1]) as doc:
    extracted = "".join(page.extract_text() or "" for page in doc.pages)
    for index, page in enumerate(doc.pages):
        page.to_image(resolution=100).save(qa / f"page-{index + 1}.png")
        for word in page.extract_words():
            if word["x0"] < 45 or word["x1"] > page.width - 45 or word["top"] < 20 or word["bottom"] > page.height - 8:
                raise ValueError(f"Text outside page margins on page {index + 1}: {word['text']}")
    print(f"Rendered {len(doc.pages)} pages. All text inside page margins.")
    if len(sys.argv) > 2:
        report = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
        def normalized(value):
            value = re.sub(r"[\u2010-\u2015\u2212]", "-", value)
            return re.sub(r"\s", "", value)
        actual = normalized(extracted)
        expected = [report["checkedAt"], report["finalUrl"], report["scope"], report["version"]]
        expected += report["limitations"]
        for finding in report["findings"]:
            expected += [finding[key] for key in ("title", "evidence", "meaning", "action", "source")]
        for text in expected:
            if normalized(text) not in actual:
                raise ValueError(f"Saved evidence missing from PDF: {text}")
        print(f"Validated all {len(report['findings'])} findings, timestamp, sources and limitations against the saved report.")
