#!/usr/bin/env bash
# Per-service versioning (versions.yaml). Used by Makefile, kustomize, CI release.
#
# Services: user-account | frontend | ai-backend
#
# Usage:
#   version.sh show [service]          # one version or all (YAML)
#   version.sh image-tag <service>     # v1.2.0
#   version.sh bump <level> <service>  # patch|minor|major
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSIONS_FILE="${ROOT}/versions.yaml"
VALID_SERVICES="user-account frontend ai-backend"

py() {
  python3 - "$@" <<'PY'
import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1])
VERSIONS_FILE = ROOT / "versions.yaml"
VALID = ("user-account", "frontend", "ai-backend")
FALLBACK = {s: "1.0.0" for s in VALID}

def load_versions():
    if not VERSIONS_FILE.exists():
        return dict(FALLBACK)
    data = {}
    for line in VERSIONS_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, val = line.split(":", 1)
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key in VALID:
            data[key] = val
    for s in VALID:
        data.setdefault(s, FALLBACK[s])
    return data

def parse_git_tag():
    import subprocess
    r = subprocess.run(
        ["git", "-C", str(ROOT), "describe", "--tags", "--exact-match"],
        capture_output=True,
        text=True,
    )
    if r.returncode != 0:
        return None
    tag = r.stdout.strip()
    m = re.fullmatch(r"(backend|frontend|ai)/v([0-9]+\.[0-9]+\.[0-9]+)", tag)
    if not m:
        return None
    kind, ver = m.group(1), m.group(2)
    mapping = {"backend": "user-account", "frontend": "frontend", "ai": "ai-backend"}
    return mapping[kind], ver

def bump(ver: str, level: str) -> str:
    major, minor, patch = (int(x) for x in ver.split("."))
    if level == "patch":
        patch += 1
    elif level == "minor":
        minor += 1
        patch = 0
    elif level == "major":
        major += 1
        minor = 0
        patch = 0
    else:
        raise SystemExit(f"unknown level: {level}")
    return f"{major}.{minor}.{patch}"

def write_versions(data):
    lines = [
        "# SemVer per service (without \"v\" prefix). Image tags: v{version}",
    ]
    for s in VALID:
        lines.append(f'{s}: "{data[s]}"')
    lines.append("")
    VERSIONS_FILE.write_text("\n".join(lines), encoding="utf-8")

cmd = sys.argv[2] if len(sys.argv) > 2 else "show"
service = sys.argv[3] if len(sys.argv) > 3 else ""

if cmd == "show":
    data = load_versions()
    git = parse_git_tag()
    if git:
        gsvc, gver = git
        data[gsvc] = gver
    if service:
        if service not in VALID:
            raise SystemExit(f"unknown service: {service}")
        print(data[service])
    else:
        for s in VALID:
            print(f"{s}: {data[s]}")

elif cmd == "image-tag":
    if service not in VALID:
        raise SystemExit(f"usage: version.sh image-tag <{'|'.join(VALID)}>")
    data = load_versions()
    git = parse_git_tag()
    if git:
        gsvc, gver = git
        if gsvc == service:
            print(f"v{gver}")
            raise SystemExit
    print(f"v{data[service]}")

elif cmd == "bump":
    level = service
    svc = sys.argv[4] if len(sys.argv) > 4 else ""
    if level not in ("patch", "minor", "major") or svc not in VALID:
        raise SystemExit("usage: version.sh bump patch|minor|major <service>")
    data = load_versions()
    data[svc] = bump(data[svc], level)
    write_versions(data)
    print(data[svc])

else:
    raise SystemExit(
        "usage: version.sh {show [service]|image-tag <service>|bump patch|minor|major <service>}"
    )
PY
}

cmd="${1:-show}"
shift || true
py "${ROOT}" "${cmd}" "$@"
