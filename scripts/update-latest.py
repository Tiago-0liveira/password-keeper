import os
import json
import pathlib
from datetime import datetime, timezone

# ⚙️ Read package.json
package_json_path = pathlib.Path("package.json").resolve()
if not package_json_path.exists():
    print(f"❌ package.json not found at {package_json_path}")
    exit(1)

with open(package_json_path, "r", encoding="utf-8") as f:
    pkg = json.load(f)

APP_NAME = pkg.get("name", "my-app")
VERSION = pkg.get("version", "3.1.0")

# Ask user for release notes
defaultNote = "Bug fixes and improvements"
notes = input("📝 Enter release notes: ").strip()
if not notes or len(notes) == 0:
    print(f"⚠  Notes defaulted to: {defaultNote}")
    notes = defaultNote

# Paths
bundle_dir = pathlib.Path("src-tauri/target/release/bundle/nsis").resolve()
exe_name = f"{APP_NAME}_{VERSION}_x64-setup.exe"
sig_name = f"{exe_name}.sig"

sig_path = bundle_dir / sig_name
if not sig_path.exists():
    print(f"❌ Signature file not found: {sig_path}")
    exit(1)

# Read signature
with open(sig_path, "r", encoding="utf-8") as f:
    signature = f.read().strip()

# Build download URL (GitHub release "latest" tag)
REPO_URL = "https://github.com/Tiago-0liveira/password-keeper"
url = f"{REPO_URL}/releases/download/v{VERSION}/{exe_name}"

# Create latest.json structure
latest = {
    "version": VERSION,
    "notes": notes,
    "pub_date": datetime.now(timezone.utc).isoformat(),
    "platforms": {
        "windows-x86_64": {
            "arch": "x64",
            "url": url,
            "signature": signature
        }
    }
}

# Write latest.json
with open("latest.json", "w", encoding="utf-8") as f:
    json.dump(latest, f, indent=4)

print(f"✅ latest.json generated successfully for {APP_NAME} v{VERSION}!")
