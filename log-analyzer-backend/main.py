from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

# Enable CORS so your Next.js app can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def compute_lps(pattern):
    m, i, length = len(pattern), 1, 0
    lps = [0] * m
    while i < m:
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0:
                length = lps[length - 1]
            else:
                lps[i] = 0
                i += 1
    return lps

def kmp_search(text, pattern):
    n, m = len(text), len(pattern)
    lps = compute_lps(pattern)
    i = j = 0
    matches = []
    while i < n:
        if pattern[j] == text[i]:
            i += 1
            j += 1
        if j == m:
            matches.append(i - j)
            j = lps[j - 1]
        elif i < n and pattern[j] != text[i]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
    return matches

@app.post("/analyze")
async def analyze_logs(file: UploadFile = File(...)):
    content = (await file.read()).decode("utf-8")
    lines = content.splitlines()
    
    # Common attack signatures
    signatures = {"SQL Injection": "OR 1=1", "XSS": "<script>", "Path Traversal": "../"}
    
    findings = []
    start_time = time.perf_counter()
    
    for line_num, line in enumerate(lines):
        for threat, pattern in signatures.items():
            indices = kmp_search(line, pattern)
            if indices:
                findings.append({
                    "line": line_num + 1,
                    "content": line,
                    "threat": threat,
                    "indices": indices
                })
                
    end_time = time.perf_counter()
    
    return {
        "filename": file.filename,
        "total_lines": len(lines),
        "threats_found": len(findings),
        "execution_time_ms": (end_time - start_time) * 1000,
        "results": findings
    }