#!/bin/bash
cd "$(dirname "$0")/.." || exit 1
echo "=== Vercel Blob setup ==="
bash scripts/setup-vercel-blob.sh
echo
echo "Press Enter to close…"
read -r _
