# FounderOS — Windows & Mobile Cross-Platform Architecture

FounderOS has been converted into a native **Windows Desktop Application** and a cross-platform **Mobile Application (Android & iOS)** while preserving the full command center, local SQLite database, AI agent rosters, and background processes.

---

## 1. Windows Desktop Application (Electron)

The Windows application packages FounderOS into a native Windows executable with:
- **Native Windows Desktop Window**: Frameless/dark-themed window matching the Monolith design system.
- **Persistent App Data**: SQLite databases are mapped to `%APPDATA%/FounderOS/data`, ensuring data persists across updates.
- **System Tray**: Sits in the Windows system notification area with quick actions (Open Command Center, Active Agents, Copy Mobile Companion URL, Quit).
- **Background Agent Execution**: Node.js and Next.js run seamlessly with support for `better-sqlite3`, IMAP/SMTP connectors, and AI agent routines.
- **LAN / Companion Host**: Exposes local network IP (e.g. `http://192.168.1.X:4100`) so mobile phones on the same Wi-Fi can connect as live companions.

### Running in Development
```bash
# 1-click launcher:
run-desktop.bat

# Or via npm:
npm run electron:dev
```

### Packaging Windows `.exe` Installer
```bash
# 1-click build:
build-windows-exe.bat

# Or via npm:
npm run electron:build
```
The output binaries will be created in `dist-electron/`:
- `FounderOS Setup <version>.exe` (Full NSIS Installer with desktop/start menu shortcuts)
- `FounderOS <version>.exe` (Portable executable)

---

## 2. Mobile Application (Android & iOS via Capacitor)

The mobile app enables on-the-go access to FounderOS with two distinct modes:

### Dual Operation Modes

1. **Companion Mode (Connected to Desktop / Cloud Server)**:
   - Connects to your Windows desktop instance over local Wi-Fi or VPN/Tailscale.
   - Live stream of all AI agent runs, pulse rows, financial charts, and unified communications.
   - Trigger agent tasks and conductor chats from your phone.

2. **Standalone Mode (Offline & Travel)**:
   - Runs locally without requiring an active desktop connection.
   - **Instant Voice Capture**: Dictate thoughts, ideas, or meeting notes using device speech-to-text.
   - **Document & Receipt Scanner**: Snap photos of contracts, business cards, or receipts via `@capacitor/camera`.
   - **Local Brain Queue**: Captures are queued on-device and automatically sync into FounderOS when reconnected.

### Launching & Building for Mobile

#### Android
```bash
# Sync web assets and open Android Studio:
run-mobile-android.bat
# Or:
npm run mobile:sync
npm run mobile:android
```
In Android Studio:
- Select an emulator or connected Android device and click **Run**.
- To build a release APK: `Build -> Build Bundle(s) / APK(s) -> Build APK(s)`.

#### iOS
```bash
npm run mobile:sync
npm run mobile:ios
```
Opens Xcode on macOS for testing on the iOS Simulator or deploying to an iPhone/iPad.

---

## 3. Pairing Mobile to Windows Desktop

1. Start FounderOS on Windows (`run-desktop.bat` or `.exe`).
2. Open the tray menu or click **Pair with Windows Desktop** in the mobile drawer.
3. Note your desktop LAN address (e.g. `http://192.168.1.50:4100`).
4. On your mobile phone, ensure you are connected to the same Wi-Fi network.
5. In FounderOS Mobile, enter the desktop URL in **Companion Link** and tap **Open Command Center**.
