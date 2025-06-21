![g4-9-8-3-0-6](https://github.com/user-attachments/assets/908804f5-2968-4b10-882f-5647942fde1e)

# Project Overview

![overall_architecture](https://github.com/user-attachments/assets/18e74984-a228-4bb9-85b1-f0042e23adbc)

This project consists of the following components:

**In the cloud:**
- Appwrite project.
- Next.js API server (`backend/`).
- Next.js frontend server (`frontend/`).
- Next.js coordination server (`coordination_server/`).
- Go VPN server (`vpn/`).

**On each device:**
- Go HalluciNet CLI tool (`cli/cmd/hallucinet/`).
- Go HalluciNet daemon (`cli/cmd/hallucinetd/`).

# Usage

## Prerequisite

- **Device:** Docker Engine
- **Servers:** NodeJS and Go

Note that the device components were developed for and only tested on Ubuntu 24.04 LTS.

## Cloud Components

### Appwrite Project

Set up an Appwrite project according to the database schema described in `appwrite.json`.

### Servers

Run all servers concurrently and proxy them using the following routing rules:

- `http://<host>` → frontend server  
- `http://<host>/api/v1/` → backend server  
- `http://<host>/api/coordination` → coordination server  
- `ws://<host>/api/coordination/events` → coordination server WebSocket endpoint  
- The VPN server must **not** be publicly accessible, but must be reachable by the coordination server (e.g., `127.0.0.1:1337`).

**Configuration:**  
For all servers, copy `.env.example` to `.env` and fill in the required environment variables.

## Device Components

The CLI tools can be built manually:

```bash
cd cli
go build ./cmd/hallucinet
go build ./cmd/hallucinetd
```

However, full installation requires configuring both Docker and HalluciNet. We recommend using the install script.

```bash
curl -fsSL https://github.com/SKKU-Capstone-Team-7/hallucinet/releases/latest/download/install.sh | sh
```

After rebooting, start the HalluciNet daemon:

```bash
sudo hallucinetd
```

Then send the start signal

```bash
sudo hallucinet up
```

**Configuration:**  
The daemon configuration is located at `/etc/hallucinet/config.json` if you use the install script.
