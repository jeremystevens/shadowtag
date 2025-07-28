# ShadowTag

**ShadowTag** is a real-world multiplayer tag game played on your phone using proximity detection. Inspired by *Among Us*, players move in the physical world while trying to identify and avoid the hidden "It" — without ever knowing who it is. Think of it as sneaky tag with suspense and strategy!

## 📱 How It Works

- Each player connects using their phone.
- One player is secretly chosen as “It.”
- Phones use proximity detection (Bluetooth/Wi-Fi/ultrasound) to determine who's nearby.
- “It” must tag others without being caught.
- Tagged players are notified silently and become “It.”
- Game continues until a timer ends or all players are tagged.

## 🎯 Features

- Hidden roles (you never know who is "It")
- Real-world movement, no GPS needed
- Bluetooth-based proximity detection
- Cross-platform (works on modern mobile browsers)
- Minimal UI for immersion

## 🚀 Getting Started

### Prerequisites

- Modern smartphone with Bluetooth enabled
- Node.js (for server setup, if applicable)

### Running Locally

```bash
git clone https://github.com/yourusername/shadowtag.git
cd shadowtag
npm install
npm start
