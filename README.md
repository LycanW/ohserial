# OhSerial

A cross-platform GUI serial terminal built with **Tauri v2**, **Rust**, and **React + TypeScript**.

![Tauri](https://img.shields.io/badge/Tauri-2.0-24C8D8?logo=tauri)
![Rust](https://img.shields.io/badge/Rust-1.0+-000000?logo=rust)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)

## Features

- **Dual working modes**
  - **Traditional Serial Mode**: line-based send/receive log with timestamps, text/Hex input, and configurable line endings.
  - **Virtual Terminal Mode**: full-featured interactive terminal powered by [xterm.js](https://xtermjs.org/), compatible with ANSI/CSI escape sequences, colors, cursor movement, and full-screen TUI programs like `vim`, `htop`, and `less`.
- **Backend-first architecture**: all serial I/O, protocol encoding, and business logic live in Rust. The frontend only renders UI and forwards user actions.
- **Custom baud rates**: enter any baud rate freely, not limited to fixed presets.
- **Cross-platform**: targets Windows, macOS, and Linux thanks to Tauri and the `serialport` crate.
- **Modern UI**: dark-themed interface built with Tailwind CSS and shadcn/ui primitives.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop framework | Tauri v2 |
| Backend | Rust |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Terminal emulation | xterm.js + @xterm/addon-fit |
| Serial communication | `serialport` crate |

## Project Structure

```
ohserial/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # Tauri communication hooks
│   ├── types.ts            # Shared TypeScript types
│   └── App.tsx             # Root layout
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── commands.rs     # Tauri commands exposed to frontend
│   │   ├── serial/         # Serial port manager and worker
│   │   ├── protocol/       # Text/Hex encoding and decoding
│   │   ├── terminal/       # Legacy terminal grid (unused by xterm.js mode)
│   │   └── ...
│   └── Cargo.toml
├── docs/                   # Design docs and implementation plan
└── package.json
```

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Rust](https://www.rust-lang.org/tools/install)
- Tauri system dependencies for your platform ([see Tauri docs](https://tauri.app/start/prerequisites/))

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run tauri dev
```

### Build for production

```bash
npm run tauri:build
```

Production bundles will be written to `src-tauri/target/release/bundle/`.

## Usage

1. Select your serial port from the dropdown (or type the path manually).
2. Enter a baud rate. Presets are provided, but any positive integer is accepted.
3. Configure data bits, parity, and stop bits as needed.
4. Click **Open** to connect.
5. Switch between **Traditional Serial** and **Virtual Terminal** modes depending on your workflow.

## License

MIT
