#!/bin/bash
set -e

# Check and install jq if missing
if ! command -v jq &>/dev/null; then
  echo "[0/5] 'jq' not found. Installing..."
  sudo apt update && sudo apt install -y jq
fi

# 1. Download binaries
echo "[1/5] Downloading hallucinet and hallucinetd..."
sudo curl -fsSL https://github.com/SKKU-Capstone-Team-7/hallucinet/releases/latest/download/hallucinet -o /usr/bin/hallucinet
sudo curl -fsSL https://github.com/SKKU-Capstone-Team-7/hallucinet/releases/latest/download/hallucinetd -o /usr/bin/hallucinetd
sudo chmod +x /usr/bin/hallucinet /usr/bin/hallucinetd

# 2. Create config directory
echo "[2/5] Creating /etc/hallucinet if it doesn't exist..."
sudo mkdir -p /etc/hallucinet

# 3. Download config.json
echo "[3/5] Downloading hallucinet config.json..."
sudo curl -fsSL https://raw.githubusercontent.com/SKKU-Capstone-Team-7/hallucinet/develop/config/config.json -o /etc/hallucinet/config.json

# 4. Modify /etc/docker/daemon.json without removing existing keys
echo "[4/5] Updating /etc/docker/daemon.json..."
DAEMON_JSON="/etc/docker/daemon.json"
TMP_FILE=$(mktemp)

# Ensure daemon.json exists and is valid JSON
if [ ! -s "$DAEMON_JSON" ] || ! jq empty "$DAEMON_JSON" 2>/dev/null; then
  echo '{}' | sudo tee "$DAEMON_JSON" >/dev/null
fi

# Update or add fields
sudo jq '.
  | .iptables = false
  | .["allow-direct-routing"] = true' "$DAEMON_JSON" >"$TMP_FILE"

sudo mv "$TMP_FILE" "$DAEMON_JSON"

# 5. Prompt for restart
echo "[5/5] Setup complete."
echo "⚠️  Please restart your device"
