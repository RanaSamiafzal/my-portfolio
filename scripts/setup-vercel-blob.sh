#!/usr/bin/env bash
# One-shot: link Vercel + pull BLOB_READ_WRITE_TOKEN into apps/web/.env.local
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Switching Vercel scope to personal team"
npx --yes vercel switch ranasamiafzals-projects <<'EOF' || true
y
EOF

echo "==> Linking project (non-interactive where possible)"
# If .vercel missing, try common portfolio project names
if [[ ! -f .vercel/project.json ]]; then
  for name in my-portfolio portfolio ranasami-portfolio my-portfolio-peach-three-14; do
    echo "Trying project: $name"
    if npx --yes vercel link --yes --scope ranasamiafzals-projects --project "$name"; then
      break
    fi
  done
fi

if [[ ! -f .vercel/project.json ]]; then
  echo "Could not auto-link. Run interactively:"
  echo "  npx vercel link --scope ranasamiafzals-projects"
  exit 1
fi

echo "==> Pulling env"
EXISTING=""
[[ -f apps/web/.env.local ]] && EXISTING="$(cat apps/web/.env.local)"
npx --yes vercel env pull apps/web/.env.pulled.local --yes

# Merge: prefer pulled BLOB token, keep other local secrets
python3 - <<'PY'
from pathlib import Path

def parse(text: str):
    out = {}
    order = []
    for line in text.splitlines():
        if not line.strip() or line.strip().startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        if k not in out:
            order.append(k)
        out[k] = v
    return out, order

root = Path("apps/web")
existing_text = (root / ".env.local").read_text() if (root / ".env.local").exists() else ""
pulled_text = (root / ".env.pulled.local").read_text() if (root / ".env.pulled.local").exists() else ""
ex, order = parse(existing_text)
pu, _ = parse(pulled_text)
ex.update({k: v for k, v in pu.items() if v})
# ensure blob from pulled wins
if pu.get("BLOB_READ_WRITE_TOKEN"):
    ex["BLOB_READ_WRITE_TOKEN"] = pu["BLOB_READ_WRITE_TOKEN"]
keys = list(dict.fromkeys([*order, *pu.keys()]))
(root / ".env.local").write_text("\n".join(f"{k}={ex[k]}" for k in keys if k in ex) + "\n")
(root / ".env.pulled.local").unlink(missing_ok=True)
blob = bool(ex.get("BLOB_READ_WRITE_TOKEN"))
print("BLOB_READ_WRITE_TOKEN:", "OK" if blob else "MISSING")
if not blob:
    raise SystemExit(2)
PY

echo "==> Done. Restart: npm run dev"
