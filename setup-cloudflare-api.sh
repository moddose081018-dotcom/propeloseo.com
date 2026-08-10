#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="/root/.cloudflare"
CONFIG_FILE="${CONFIG_DIR}/credentials"

echo ""
echo "============================================"
echo "  Cloudflare API Setup for PropeloSEO"
echo "============================================"
echo ""

if [[ -f "$CONFIG_FILE" ]]; then
    echo "Existing Cloudflare credentials found at ${CONFIG_FILE}."
    read -rp "Overwrite? (y/n): " overwrite
    if [[ "$overwrite" != "y" && "$overwrite" != "Y" ]]; then
        echo "Keeping existing credentials. Exiting."
        exit 0
    fi
fi

mkdir -p "$CONFIG_DIR"
chmod 700 "$CONFIG_DIR"

echo "Paste your Cloudflare API Token below."
echo "(You can create one at: https://dash.cloudflare.com/profile/api-tokens)"
echo ""
read -rsp "API Token: " cf_api_token
echo ""

if [[ -z "$cf_api_token" ]]; then
    echo "Error: No API token entered. Exiting."
    exit 1
fi

echo ""
read -rp "Zone ID (find it on your domain's Overview page — leave blank to skip): " cf_zone_id
read -rp "Account ID (same Overview page — leave blank to skip): " cf_account_id

echo ""
echo "Verifying token with Cloudflare..."
verify_response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer ${cf_api_token}" \
    "https://api.cloudflare.com/client/v4/user/tokens/verify")

http_code=$(echo "$verify_response" | tail -1)
body=$(echo "$verify_response" | head -n -1)

if [[ "$http_code" == "200" ]] && echo "$body" | grep -q '"success":true'; then
    echo "Token verified successfully."
else
    echo "WARNING: Token verification failed (HTTP ${http_code})."
    echo "Response: ${body}"
    read -rp "Save anyway? (y/n): " save_anyway
    if [[ "$save_anyway" != "y" && "$save_anyway" != "Y" ]]; then
        echo "Exiting without saving."
        exit 1
    fi
fi

cat > "$CONFIG_FILE" <<EOF
CF_API_TOKEN="${cf_api_token}"
CF_ZONE_ID="${cf_zone_id}"
CF_ACCOUNT_ID="${cf_account_id}"
EOF

chmod 600 "$CONFIG_FILE"

BASHRC="/root/.bashrc"
MARKER="# Cloudflare API credentials"
if ! grep -qF "$MARKER" "$BASHRC" 2>/dev/null; then
    cat >> "$BASHRC" <<EOF

${MARKER}
if [[ -f ${CONFIG_FILE} ]]; then
    set -a
    source ${CONFIG_FILE}
    set +a
fi
EOF
    echo "Added auto-load to ${BASHRC}."
fi

set -a
source "$CONFIG_FILE"
set +a

echo ""
echo "============================================"
echo "  Setup complete!"
echo "============================================"
echo ""
echo "Credentials saved to: ${CONFIG_FILE}"
echo "Variables available in this session and future logins:"
echo "  \$CF_API_TOKEN  (hidden)"
[[ -n "$cf_zone_id" ]] && echo "  \$CF_ZONE_ID    = ${cf_zone_id}"
[[ -n "$cf_account_id" ]] && echo "  \$CF_ACCOUNT_ID = ${cf_account_id}"
echo ""
echo "Test it anytime with:"
echo "  curl -s -H \"Authorization: Bearer \$CF_API_TOKEN\" \\"
echo "    https://api.cloudflare.com/client/v4/user/tokens/verify | python3 -m json.tool"
echo ""
