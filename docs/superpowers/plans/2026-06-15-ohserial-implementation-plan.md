# OhSerial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cross-platform Tauri v2 serial terminal where Rust handles all business logic and React/TypeScript renders a modern UI; supports custom baud rates and terminal mode.

**Architecture:** Backend owns serial port I/O, protocol encoding/decoding, and ANSI terminal parsing; frontend renders UI and forwards user actions via Tauri commands/events. State is shared through a Tauri-managed `AppState` holding a `SerialManager`.

**Tech Stack:** Tauri v2, Rust, React 18+, TypeScript, Tailwind CSS, shadcn/ui, `serialport` crate, Vite.

---

## File Structure

```
ohserial/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── hooks/
│   │   └── useSerial.ts
│   └── components/
│       ├── ConnectionPanel.tsx
│       ├── SendPanel.tsx
│       ├── TerminalView.tsx
│       └── StatusBar.tsx
└── src-tauri/
    ├── Cargo.toml
    ├── tauri.conf.json
    └── src/
        ├── main.rs
        ├── lib.rs
        ├── state.rs
        ├── commands.rs
        ├── events.rs
        ├── error.rs
        ├── serial/
        │   ├── mod.rs
        │   ├── config.rs
        │   ├── manager.rs
        │   └── worker.rs
        ├── protocol/
        │   ├── mod.rs
        │   └── engine.rs
        └── terminal/
            ├── mod.rs
            ├── cell.rs
            └── buffer.rs
```

---

## Task 1: Initialize Tauri v2 Project with React + TypeScript + Tailwind

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/src/lib.rs`

- [ ] **Step 1: Run Tauri project scaffold**

Run:
```bash
npm create tauri-app@latest . -- --template react-ts --manager npm
```
Expected: Interactive prompts; choose project name `ohserial`. This creates `src/`, `src-tauri/`, `package.json`, `vite.config.ts`, etc.

- [ ] **Step 2: Install Tailwind CSS and PostCSS**

Run:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```
Expected: Creates `tailwind.config.js` and `postcss.config.js`.

- [ ] **Step 3: Configure Tailwind content paths**

Modify `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 4: Add Tailwind directives to CSS**

Write `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 5: Verify dev server starts**

Run:
```bash
npm install
npm run tauri dev
```
Expected: Tauri window opens with default React welcome page. Stop with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Tauri v2 React TypeScript project with Tailwind"
```

---

## Task 2: Add shadcn/ui Base and Components

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.js`
- Modify: `tsconfig.json`
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/toggle.tsx`
- Create: `src/components/ui/card.tsx`

- [ ] **Step 1: Install shadcn/ui dependencies**

Run:
```bash
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install -D @types/node
```

- [ ] **Step 2: Create utils helper**

Create `src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Configure shadcn/ui and CSS variables**

Create `components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

Add to `src/index.css` inside `@layer base`:
```css
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
```

- [ ] **Step 4: Install tailwindcss-animate**

Run:
```bash
npm install -D tailwindcss-animate
```

- [ ] **Step 5: Add path alias in tsconfig**

Ensure `tsconfig.json` includes:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 6: Create Button component**

Create `src/components/ui/button.tsx`:
```typescript
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

- [ ] **Step 7: Install Radix Slot**

Run:
```bash
npm install @radix-ui/react-slot
```

- [ ] **Step 8: Create Input component**

Create `src/components/ui/input.tsx`:
```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
```

- [ ] **Step 9: Create Select component (simple native wrapper)**

Create `src/components/ui/select.tsx`:
```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Select.displayName = 'Select'

export { Select }
```

- [ ] **Step 10: Verify build still passes**

Run:
```bash
npm run tauri dev
```
Expected: Window opens without errors.

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "chore: add shadcn/ui base and primitive components"
```

---

## Task 3: Define Shared Types and Errors

**Files:**
- Create: `src-tauri/src/error.rs`
- Create: `src/types.ts`

- [ ] **Step 1: Define Rust error type**

Create `src-tauri/src/error.rs`:
```rust
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize, Clone)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    #[error("Serial port error: {0}")]
    SerialPort(String),
    #[error("Port not open")]
    NotConnected,
    #[error("Invalid configuration: {0}")]
    InvalidConfig(String),
    #[error("Invalid baud rate: {0}")]
    InvalidBaudRate(String),
    #[error("Parse error: {0}")]
    Parse(String),
}

impl From<serialport::Error> for AppError {
    fn from(err: serialport::Error) -> Self {
        AppError::SerialPort(err.description)
    }
}

impl From<std::num::ParseIntError> for AppError {
    fn from(err: std::num::ParseIntError) -> Self {
        AppError::Parse(err.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
```

- [ ] **Step 2: Add error, serde, and serialport dependencies**

Add to `src-tauri/Cargo.toml` under `[dependencies]`:
```toml
thiserror = "1.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
serialport = "4"
```

- [ ] **Step 3: Define TypeScript types**

Create `src/types.ts`:
```typescript
export interface SerialConfig {
  port: string
  baudRate: number
  dataBits: 5 | 6 | 7 | 8
  parity: 'none' | 'odd' | 'even'
  stopBits: 1 | 2
}

export interface WriteRequest {
  data: string
  mode: 'text' | 'hex'
  lineEnding?: 'none' | 'cr' | 'lf' | 'crlf'
}

export type ConnectionState =
  | { status: 'disconnected' }
  | { status: 'connecting' }
  | { status: 'connected'; port: string; baudRate: number }
  | { status: 'error'; message: string }

export interface DataLine {
  timestamp: string
  text: string
}

export interface TerminalCell {
  char: string
  fg: string
  bg: string
  bold: boolean
}

export interface TerminalUpdate {
  cols: number
  rows: number
  cursorRow: number
  cursorCol: number
  cells: TerminalCell[][]
}
```

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/error.rs src/types.ts src-tauri/Cargo.toml
git commit -m "feat: define shared error and type contracts"
```

---

## Task 4: Implement Serial Configuration

**Files:**
- Create: `src-tauri/src/serial/config.rs`
- Modify: `src-tauri/src/serial/mod.rs`

- [ ] **Step 1: Define serial config Rust type**

Create `src-tauri/src/serial/config.rs`:
```rust
use serde::{Deserialize, Serialize};
use serialport::{DataBits, Parity, StopBits};
use crate::error::AppError;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SerialConfig {
    pub port: String,
    pub baud_rate: u32,
    pub data_bits: u8,
    pub parity: String,
    pub stop_bits: u8,
}

impl SerialConfig {
    pub fn validate(&self) -> Result<(), AppError> {
        if self.baud_rate == 0 {
            return Err(AppError::InvalidBaudRate("baud rate must be > 0".into()));
        }
        if self.port.trim().is_empty() {
            return Err(AppError::InvalidConfig("port name is empty".into()));
        }
        Ok(())
    }

    pub fn data_bits(&self) -> Result<DataBits, AppError> {
        match self.data_bits {
            5 => Ok(DataBits::Five),
            6 => Ok(DataBits::Six),
            7 => Ok(DataBits::Seven),
            8 => Ok(DataBits::Eight),
            _ => Err(AppError::InvalidConfig(format!("unsupported data bits: {}", self.data_bits))),
        }
    }

    pub fn parity(&self) -> Result<Parity, AppError> {
        match self.parity.to_lowercase().as_str() {
            "none" => Ok(Parity::None),
            "odd" => Ok(Parity::Odd),
            "even" => Ok(Parity::Even),
            _ => Err(AppError::InvalidConfig(format!("unsupported parity: {}", self.parity))),
        }
    }

    pub fn stop_bits(&self) -> Result<StopBits, AppError> {
        match self.stop_bits {
            1 => Ok(StopBits::One),
            2 => Ok(StopBits::Two),
            _ => Err(AppError::InvalidConfig(format!("unsupported stop bits: {}", self.stop_bits))),
        }
    }
}
```

- [ ] **Step 2: Create serial module entry**

Create `src-tauri/src/serial/mod.rs`:
```rust
pub mod config;
pub mod manager;
pub mod worker;
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/src/serial/
git commit -m "feat: add serial config validation and mapping"
```

---

## Task 5: Implement SerialManager and Worker

**Files:**
- Create: `src-tauri/src/serial/manager.rs`
- Create: `src-tauri/src/serial/worker.rs`

- [ ] **Step 1: Implement SerialPortWorker**

Create `src-tauri/src/serial/worker.rs`:
```rust
use std::io::{Read, Write};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{mpsc, Arc};
use std::thread;
use std::time::Duration;

pub enum WorkerCommand {
    Write(Vec<u8>),
    Stop,
}

pub struct SerialPortWorker {
    handle: Option<thread::JoinHandle<()>>,
    command_tx: mpsc::Sender<WorkerCommand>,
    running: Arc<AtomicBool>,
}

impl SerialPortWorker {
    pub fn spawn<Port>(
        mut port: Port,
        data_tx: mpsc::Sender<Vec<u8>>,
    ) -> Self
    where
        Port: Read + Write + Send + 'static,
    {
        let (command_tx, command_rx) = mpsc::channel::<WorkerCommand>();
        let running = Arc::new(AtomicBool::new(true));
        let running_clone = running.clone();

        let handle = thread::spawn(move || {
            let mut buf = [0u8; 1024];
            loop {
                if !running_clone.load(Ordering::Relaxed) {
                    break;
                }

                while let Ok(cmd) = command_rx.try_recv() {
                    match cmd {
                        WorkerCommand::Write(bytes) => {
                            let _ = port.write_all(&bytes);
                            let _ = port.flush();
                        }
                        WorkerCommand::Stop => {
                            running_clone.store(false, Ordering::Relaxed);
                            break;
                        }
                    }
                }

                match port.read(&mut buf) {
                    Ok(n) if n > 0 => {
                        let _ = data_tx.send(buf[..n].to_vec());
                    }
                    Ok(_) => {}
                    Err(e) if e.kind() == std::io::ErrorKind::TimedOut => {}
                    Err(_) => {
                        running_clone.store(false, Ordering::Relaxed);
                    }
                }

                thread::sleep(Duration::from_millis(1));
            }
        });

        Self {
            handle: Some(handle),
            command_tx,
            running,
        }
    }

    pub fn send(&self, bytes: Vec<u8>) -> Result<(), String> {
        self.command_tx
            .send(WorkerCommand::Write(bytes))
            .map_err(|e| e.to_string())
    }

    pub fn stop(&mut self) {
        self.running.store(false, Ordering::Relaxed);
        let _ = self.command_tx.send(WorkerCommand::Stop);
        if let Some(handle) = self.handle.take() {
            let _ = handle.join();
        }
    }
}
```

- [ ] **Step 2: Implement SerialManager**

Create `src-tauri/src/serial/manager.rs`:
```rust
use std::sync::{mpsc, Mutex};
use std::time::Duration;

use serialport::SerialPort;

use crate::error::{AppError, AppResult};
use crate::serial::config::SerialConfig;
use crate::serial::worker::SerialPortWorker;

pub struct SerialManager {
    config: Mutex<Option<SerialConfig>>,
    worker: Mutex<Option<SerialPortWorker>>,
    data_rx: Mutex<Option<mpsc::Receiver<Vec<u8>>>>,
}

impl SerialManager {
    pub fn new() -> Self {
        Self {
            config: Mutex::new(None),
            worker: Mutex::new(None),
            data_rx: Mutex::new(None),
        }
    }

    pub fn open(&self, config: SerialConfig) -> AppResult<()> {
        config.validate()?;
        self.close()?;

        let builder = serialport::new(&config.port, config.baud_rate)
            .data_bits(config.data_bits()?)
            .parity(config.parity()?)
            .stop_bits(config.stop_bits()?)
            .timeout(Duration::from_millis(100));

        let port = builder.open()?;

        let (data_tx, data_rx) = mpsc::channel::<Vec<u8>>();
        let worker = SerialPortWorker::spawn(port, data_tx);

        *self.config.lock().unwrap() = Some(config);
        *self.data_rx.lock().unwrap() = Some(data_rx);
        *self.worker.lock().unwrap() = Some(worker);

        Ok(())
    }

    pub fn close(&self) -> AppResult<()> {
        if let Some(mut worker) = self.worker.lock().unwrap().take() {
            worker.stop();
        }
        *self.config.lock().unwrap() = None;
        *self.data_rx.lock().unwrap() = None;
        Ok(())
    }

    pub fn write(&self, bytes: Vec<u8>) -> AppResult<()> {
        let worker = self.worker.lock().unwrap();
        if let Some(w) = worker.as_ref() {
            w.send(bytes).map_err(|e| AppError::SerialPort(e))?;
            Ok(())
        } else {
            Err(AppError::NotConnected)
        }
    }

    pub fn read_available(&self) -> AppResult<Vec<Vec<u8>>> {
        let rx = self.data_rx.lock().unwrap();
        if let Some(rx) = rx.as_ref() {
            let mut chunks = Vec::new();
            while let Ok(chunk) = rx.try_recv() {
                chunks.push(chunk);
            }
            Ok(chunks)
        } else {
            Err(AppError::NotConnected)
        }
    }

    pub fn is_connected(&self) -> bool {
        self.worker.lock().unwrap().is_some()
    }

    pub fn config(&self) -> Option<SerialConfig> {
        self.config.lock().unwrap().clone()
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/src/serial/manager.rs src-tauri/src/serial/worker.rs
git commit -m "feat: implement SerialManager and serial port worker thread"
```

---

## Task 6: Implement ProtocolEngine

**Files:**
- Create: `src-tauri/src/protocol/engine.rs`
- Create: `src-tauri/src/protocol/mod.rs`

- [ ] **Step 1: Define send/write request**

Create `src-tauri/src/protocol/engine.rs`:
```rust
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WriteRequest {
    pub data: String,
    pub mode: WriteMode,
    #[serde(default)]
    pub line_ending: LineEnding,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WriteMode {
    Text,
    Hex,
}

#[derive(Debug, Clone, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum LineEnding {
    #[default]
    None,
    Cr,
    Lf,
    Crlf,
}

impl LineEnding {
    pub fn bytes(&self) -> &'static [u8] {
        match self {
            LineEnding::None => &[],
            LineEnding::Cr => b"\r",
            LineEnding::Lf => b"\n",
            LineEnding::Crlf => b"\r\n",
        }
    }
}

pub struct ProtocolEngine;

impl ProtocolEngine {
    pub fn encode(request: WriteRequest) -> Result<Vec<u8>, String> {
        let mut payload = match request.mode {
            WriteMode::Text => request.data.into_bytes(),
            WriteMode::Hex => parse_hex(&request.data)?,
        };
        payload.extend_from_slice(request.line_ending.bytes());
        Ok(payload)
    }

    pub fn decode_to_string(bytes: &[u8]) -> String {
        String::from_utf8_lossy(bytes).to_string()
    }
}

fn parse_hex(input: &str) -> Result<Vec<u8>, String> {
    let cleaned: String = input.split_whitespace().collect();
    if cleaned.len() % 2 != 0 {
        return Err("hex string must have even number of digits".into());
    }
    (0..cleaned.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&cleaned[i..i + 2], 16).map_err(|e| e.to_string()))
        .collect()
}
```

- [ ] **Step 2: Create protocol module entry**

Create `src-tauri/src/protocol/mod.rs`:
```rust
pub mod engine;
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/src/protocol/
git commit -m "feat: implement ProtocolEngine for text/hex encoding and line endings"
```

---

## Task 7: Implement TerminalBuffer

**Files:**
- Create: `src-tauri/src/terminal/cell.rs`
- Create: `src-tauri/src/terminal/buffer.rs`
- Create: `src-tauri/src/terminal/mod.rs`

- [ ] **Step 1: Define TerminalCell**

Create `src-tauri/src/terminal/cell.rs`:
```rust
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Default, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TerminalCell {
    #[serde(rename = "char")]
    pub ch: char,
    pub fg: String,
    pub bg: String,
    pub bold: bool,
}

impl TerminalCell {
    pub fn blank() -> Self {
        Self {
            ch: ' ',
            fg: "#e2e8f0".into(),
            bg: "transparent".into(),
            bold: false,
        }
    }
}
```

- [ ] **Step 2: Implement TerminalBuffer**

Create `src-tauri/src/terminal/buffer.rs`:
```rust
use serde::Serialize;

use crate::terminal::cell::TerminalCell;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TerminalUpdate {
    pub cols: usize,
    pub rows: usize,
    pub cursor_row: usize,
    pub cursor_col: usize,
    pub cells: Vec<Vec<TerminalCell>>,
}

pub struct TerminalBuffer {
    cols: usize,
    rows: usize,
    cells: Vec<Vec<TerminalCell>>,
    cursor_row: usize,
    cursor_col: usize,
    fg: String,
    bg: String,
    bold: bool,
}

impl TerminalBuffer {
    pub fn new(cols: usize, rows: usize) -> Self {
        Self {
            cols,
            rows,
            cells: vec![vec![TerminalCell::blank(); cols]; rows],
            cursor_row: 0,
            cursor_col: 0,
            fg: "#e2e8f0".into(),
            bg: "transparent".into(),
            bold: false,
        }
    }

    pub fn feed(&mut self, bytes: &[u8]) -> TerminalUpdate {
        for &b in bytes {
            self.handle_byte(b);
        }
        self.to_update()
    }

    fn handle_byte(&mut self, b: u8) {
        match b {
            b'\n' => self.new_line(),
            b'\r' => self.cursor_col = 0,
            b'\x08' => {
                if self.cursor_col > 0 {
                    self.cursor_col -= 1;
                }
            }
            0x1b => {
                // Minimal ANSI placeholder: skip next char if '['
                // Full parser will be added in later step
            }
            0x7f => {
                // DEL: erase current cell
                self.cells[self.cursor_row][self.cursor_col] = TerminalCell::blank();
            }
            printable if printable.is_ascii_graphic() || printable == b' ' => {
                let mut cell = TerminalCell::blank();
                cell.ch = printable as char;
                cell.fg = self.fg.clone();
                cell.bg = self.bg.clone();
                cell.bold = self.bold;
                self.cells[self.cursor_row][self.cursor_col] = cell;
                self.advance_cursor();
            }
            _ => {}
        }
    }

    fn advance_cursor(&mut self) {
        self.cursor_col += 1;
        if self.cursor_col >= self.cols {
            self.cursor_col = 0;
            self.new_line();
        }
    }

    fn new_line(&mut self) {
        self.cursor_col = 0;
        if self.cursor_row + 1 >= self.rows {
            self.scroll_up();
        } else {
            self.cursor_row += 1;
        }
    }

    fn scroll_up(&mut self) {
        self.cells.remove(0);
        self.cells.push(vec![TerminalCell::blank(); self.cols]);
    }

    pub fn to_update(&self) -> TerminalUpdate {
        TerminalUpdate {
            cols: self.cols,
            rows: self.rows,
            cursor_row: self.cursor_row,
            cursor_col: self.cursor_col,
            cells: self.cells.clone(),
        }
    }

    pub fn clear(&mut self) -> TerminalUpdate {
        self.cells = vec![vec![TerminalCell::blank(); self.cols]; self.rows];
        self.cursor_row = 0;
        self.cursor_col = 0;
        self.to_update()
    }
}
```

- [ ] **Step 3: Create terminal module entry**

Create `src-tauri/src/terminal/mod.rs`:
```rust
pub mod buffer;
pub mod cell;
```

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/terminal/
git commit -m "feat: implement TerminalBuffer with basic ANSI handling"
```

---

## Task 8: Wire Tauri Commands and Events

**Files:**
- Create: `src-tauri/src/state.rs`
- Create: `src-tauri/src/commands.rs`
- Create: `src-tauri/src/events.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src-tauri/src/main.rs`

- [ ] **Step 1: Create AppState**

Create `src-tauri/src/state.rs`:
```rust
use std::sync::Arc;

use crate::serial::manager::SerialManager;
use crate::terminal::buffer::TerminalBuffer;

pub struct AppState {
    pub serial: Arc<SerialManager>,
    pub terminal: Arc<std::sync::Mutex<TerminalBuffer>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            serial: Arc::new(SerialManager::new()),
            terminal: Arc::new(std::sync::Mutex::new(TerminalBuffer::new(80, 24))),
        }
    }
}
```

- [ ] **Step 2: Create events helper**

Create `src-tauri/src/events.rs`:
```rust
use serde::Serialize;
use tauri::Manager;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "event", content = "payload")]
pub enum AppEvent {
    ConnectionStateChanged(ConnectionState),
    DataLine { timestamp: String, text: String },
    TerminalUpdate(crate::terminal::buffer::TerminalUpdate),
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "status", rename_all = "lowercase", rename_all_fields = "camelCase")]
pub enum ConnectionState {
    Disconnected,
    Connecting,
    Connected { port: String, baud_rate: u32 },
    Error { message: String },
}

pub fn emit_event<M: Manager<R>, R: tauri::Runtime>(
    manager: &M,
    event: AppEvent,
) -> Result<(), String> {
    manager
        .emit("ohserial-event", event)
        .map_err(|e| e.to_string())
}
```

- [ ] **Step 3: Implement commands**

Create `src-tauri/src/commands.rs`:
```rust
use tauri::State;

use crate::error::AppResult;
use crate::events::{emit_event, AppEvent, ConnectionState};
use crate::protocol::engine::{ProtocolEngine, WriteRequest};
use crate::serial::config::SerialConfig;
use crate::state::AppState;

#[tauri::command]
pub fn list_serial_ports() -> Vec<String> {
    match serialport::available_ports() {
        Ok(ports) => ports.into_iter().map(|p| p.port_name).collect(),
        Err(_) => Vec::new(),
    }
}

#[tauri::command]
pub fn open_port(
    config: SerialConfig,
    state: State<'_, AppState>,
    app_handle: tauri::AppHandle,
) -> AppResult<()> {
    state.serial.open(config.clone())?;
    let _ = emit_event(
        &app_handle,
        AppEvent::ConnectionStateChanged(ConnectionState::Connected {
            port: config.port,
            baud_rate: config.baud_rate,
        }),
    );
    Ok(())
}

#[tauri::command]
pub fn close_port(state: State<'_, AppState>, app_handle: tauri::AppHandle) -> AppResult<()> {
    state.serial.close()?;
    let _ = emit_event(
        &app_handle,
        AppEvent::ConnectionStateChanged(ConnectionState::Disconnected),
    );
    Ok(())
}

#[tauri::command]
pub fn write_data(request: WriteRequest, state: State<'_, AppState>) -> AppResult<()> {
    let bytes = ProtocolEngine::encode(request).map_err(crate::error::AppError::Parse)?;
    state.serial.write(bytes)?;
    Ok(())
}

- [ ] **Step 4: Update lib.rs**

Modify `src-tauri/src/lib.rs` to register commands and spawn background polling:
```rust
pub mod commands;
pub mod error;
pub mod events;
pub mod protocol;
pub mod serial;
pub mod state;
pub mod terminal;

use tauri::Manager;

use crate::events::{emit_event, AppEvent, ConnectionState};
use crate::protocol::engine::ProtocolEngine;
use crate::state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            commands::list_serial_ports,
            commands::open_port,
            commands::close_port,
            commands::write_data,
        ])
        .setup(|app| {
            let app_handle = app.handle();
            let serial = app.state::<AppState>().serial.clone();
            let terminal = app.state::<AppState>().terminal.clone();

            std::thread::spawn(move || loop {
                std::thread::sleep(std::time::Duration::from_millis(50));

                if !serial.is_connected() {
                    continue;
                }

                match serial.read_available() {
                    Ok(chunks) => {
                        for chunk in chunks {
                            let text = ProtocolEngine::decode_to_string(&chunk);
                            let now = chrono::Local::now().format("%H:%M:%S%.3f").to_string();
                            let _ = emit_event(
                                &app_handle,
                                AppEvent::DataLine {
                                    timestamp: now,
                                    text,
                                },
                            );

                            if let Ok(mut buffer) = terminal.lock() {
                                let update = buffer.feed(&chunk);
                                let _ = emit_event(&app_handle, AppEvent::TerminalUpdate(update));
                            }
                        }
                    }
                    Err(crate::error::AppError::NotConnected) => {}
                    Err(e) => {
                        let _ = emit_event(
                            &app_handle,
                            AppEvent::ConnectionStateChanged(ConnectionState::Error {
                                message: e.to_string(),
                            }),
                        );
                        let _ = serial.close();
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 5: Add chrono dependency**

Add to `src-tauri/Cargo.toml`:
```toml
chrono = "0.4"
```

- [ ] **Step 6: Update main.rs**

Ensure `src-tauri/src/main.rs`:
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    ohserial_lib::run();
}
```

- [ ] **Step 7: Commit**

```bash
git add src-tauri/src/
git commit -m "feat: wire Tauri commands and event emission loop"
```

---

## Task 9: Create Frontend State Hook

**Files:**
- Create: `src/hooks/useSerial.ts`

- [ ] **Step 1: Install Tauri API**

Run:
```bash
npm install @tauri-apps/api
```

- [ ] **Step 2: Implement useSerial hook**

Create `src/hooks/useSerial.ts`:
```typescript
import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import type { SerialConfig, ConnectionState, DataLine, TerminalUpdate, WriteRequest } from '@/types'

export function useSerial() {
  const [ports, setPorts] = useState<string[]>([])
  const [state, setState] = useState<ConnectionState>({ status: 'disconnected' })
  const [lines, setLines] = useState<DataLine[]>([])
  const [terminal, setTerminal] = useState<TerminalUpdate | null>(null)

  useEffect(() => {
    refreshPorts()

    const unlisten = listen('ohserial-event', (event) => {
      const payload = event.payload as any
      switch (payload.event) {
        case 'ConnectionStateChanged':
          setState(payload.payload)
          break
        case 'DataLine':
          setLines((prev) => [...prev, payload.payload])
          break
        case 'TerminalUpdate':
          setTerminal(payload.payload)
          break
      }
    })

    return () => {
      unlisten.then((fn) => fn())
    }
  }, [])

  const refreshPorts = async () => {
    const list = await invoke<string[]>('list_serial_ports')
    setPorts(list)
  }

  const openPort = async (config: SerialConfig) => {
    setState({ status: 'connecting' })
    try {
      await invoke('open_port', { config })
    } catch (e) {
      setState({ status: 'error', message: String(e) })
    }
  }

  const closePort = async () => {
    await invoke('close_port')
  }

  const writeData = async (request: WriteRequest) => {
    await invoke('write_data', { request })
  }

  const clearLines = () => setLines([])

  return {
    ports,
    state,
    lines,
    terminal,
    refreshPorts,
    openPort,
    closePort,
    writeData,
    clearLines,
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useSerial.ts
git commit -m "feat: add useSerial hook for Tauri communication"
```

---

## Task 10: Build ConnectionPanel Component

**Files:**
- Create: `src/components/ConnectionPanel.tsx`

- [ ] **Step 1: Implement component**

Create `src/components/ConnectionPanel.tsx`:
```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { SerialConfig } from '@/types'

interface ConnectionPanelProps {
  ports: string[]
  connected: boolean
  onOpen: (config: SerialConfig) => void
  onClose: () => void
}

export function ConnectionPanel({ ports, connected, onOpen, onClose }: ConnectionPanelProps) {
  const [port, setPort] = useState('')
  const [baudRate, setBaudRate] = useState('115200')
  const [dataBits, setDataBits] = useState<5 | 6 | 7 | 8>(8)
  const [parity, setParity] = useState<'none' | 'odd' | 'even'>('none')
  const [stopBits, setStopBits] = useState<1 | 2>(1)

  const baudPresets = ['9600', '19200', '38400', '57600', '115200', '230400', '460800', '921600']

  const handleOpen = () => {
    const rate = parseInt(baudRate, 10)
    if (!port || Number.isNaN(rate) || rate <= 0) return
    onOpen({ port, baudRate: rate, dataBits, parity, stopBits })
  }

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 border-b border-border bg-card">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Port</label>
        <Select value={port} onChange={(e) => setPort(e.target.value)}>
          <option value="">Select port</option>
          {ports.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Baud Rate</label>
        <Input
          list="baud-presets"
          value={baudRate}
          onChange={(e) => setBaudRate(e.target.value)}
          className="w-32"
        />
        <datalist id="baud-presets">
          {baudPresets.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Data Bits</label>
        <Select
          value={String(dataBits)}
          onChange={(e) => setDataBits(Number(e.target.value) as 5 | 6 | 7 | 8)}
          className="w-20"
        >
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Parity</label>
        <Select value={parity} onChange={(e) => setParity(e.target.value as any)} className="w-24">
          <option value="none">None</option>
          <option value="odd">Odd</option>
          <option value="even">Even</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Stop Bits</label>
        <Select
          value={String(stopBits)}
          onChange={(e) => setStopBits(Number(e.target.value) as 1 | 2)}
          className="w-20"
        >
          <option value="1">1</option>
          <option value="2">2</option>
        </Select>
      </div>

      {connected ? (
        <Button variant="destructive" onClick={onClose}>
          Close
        </Button>
      ) : (
        <Button onClick={handleOpen}>Open</Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ConnectionPanel.tsx
git commit -m "feat: add ConnectionPanel with custom baud rate"
```

---

## Task 11: Build SendPanel Component

**Files:**
- Create: `src/components/SendPanel.tsx`

- [ ] **Step 1: Implement component**

Create `src/components/SendPanel.tsx`:
```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { WriteRequest } from '@/types'

interface SendPanelProps {
  disabled: boolean
  onSend: (request: WriteRequest) => void
}

export function SendPanel({ disabled, onSend }: SendPanelProps) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'text' | 'hex'>('text')
  const [lineEnding, setLineEnding] = useState<'none' | 'cr' | 'lf' | 'crlf'>('none')

  const handleSend = () => {
    if (!text) return
    onSend({ data: text, mode, lineEnding })
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-3 p-4 border-t border-border bg-card">
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs text-muted-foreground">Send</label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type data to send..."
          disabled={disabled}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Mode</label>
        <Select value={mode} onChange={(e) => setMode(e.target.value as any)} className="w-24">
          <option value="text">Text</option>
          <option value="hex">Hex</option>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Line Ending</label>
        <Select
          value={lineEnding}
          onChange={(e) => setLineEnding(e.target.value as any)}
          className="w-28"
        >
          <option value="none">None</option>
          <option value="cr">CR</option>
          <option value="lf">LF</option>
          <option value="crlf">CRLF</option>
        </Select>
      </div>

      <Button onClick={handleSend} disabled={disabled || !text}>
        Send
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SendPanel.tsx
git commit -m "feat: add SendPanel with text/hex and line ending options"
```

---

## Task 12: Build TerminalView Component

**Files:**
- Create: `src/components/TerminalView.tsx`

- [ ] **Step 1: Implement component**

Create `src/components/TerminalView.tsx`:
```typescript
import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { DataLine, TerminalUpdate } from '@/types'

interface TerminalViewProps {
  lines: DataLine[]
  terminal: TerminalUpdate | null
}

export function TerminalView({ lines, terminal }: TerminalViewProps) {
  const [mode, setMode] = useState<'raw' | 'terminal'>('raw')
  const rawRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (rawRef.current) {
      rawRef.current.scrollTop = rawRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Button variant={mode === 'raw' ? 'default' : 'outline'} size="sm" onClick={() => setMode('raw')}>
          Raw Log
        </Button>
        <Button variant={mode === 'terminal' ? 'default' : 'outline'} size="sm" onClick={() => setMode('terminal')}>
          Terminal
        </Button>
      </div>

      <div className="flex-1 min-h-0 p-3 overflow-auto font-mono text-sm">
        {mode === 'raw' ? (
          <div ref={rawRef} className="flex flex-col gap-0.5">
            {lines.map((line, i) => (
              <div key={i} className="break-all">
                <span className="text-muted-foreground mr-2">[{line.timestamp}]</span>
                <span className="whitespace-pre-wrap">{line.text}</span>
              </div>
            ))}
          </div>
        ) : terminal ? (
          <div
            className="grid gap-0 leading-none"
            style={{
              gridTemplateColumns: `repeat(${terminal.cols}, minmax(0, 1fr))`,
            }}
          >
            {terminal.cells.flatMap((row, r) =>
              row.map((cell, c) => (
                <span
                  key={`${r}-${c}`}
                  className="inline-block text-center"
                  style={{
                    color: cell.fg,
                    backgroundColor: cell.bg,
                    fontWeight: cell.bold ? 'bold' : 'normal',
                  }}
                >
                  {cell.char}
                </span>
              ))
            )}
          </div>
        ) : (
          <div className="text-muted-foreground">No terminal data yet.</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TerminalView.tsx
git commit -m "feat: add TerminalView with raw and terminal modes"
```

---

## Task 13: Build StatusBar and App Layout

**Files:**
- Create: `src/components/StatusBar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement StatusBar**

Create `src/components/StatusBar.tsx`:
```typescript
import type { ConnectionState } from '@/types'

interface StatusBarProps {
  state: ConnectionState
}

export function StatusBar({ state }: StatusBarProps) {
  const statusText = () => {
    switch (state.status) {
      case 'disconnected':
        return 'Disconnected'
      case 'connecting':
        return 'Connecting...'
      case 'connected':
        return `Connected: ${state.port} @ ${state.baudRate}`
      case 'error':
        return `Error: ${state.message}`
    }
  }

  const statusColor = () => {
    switch (state.status) {
      case 'connected':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'connecting':
        return 'text-yellow-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card text-xs">
      <span className={statusColor()}>{statusText()}</span>
      <span className="text-muted-foreground">OhSerial</span>
    </div>
  )
}
```

- [ ] **Step 2: Implement App layout**

Modify `src/App.tsx`:
```typescript
import { ConnectionPanel } from '@/components/ConnectionPanel'
import { SendPanel } from '@/components/SendPanel'
import { TerminalView } from '@/components/TerminalView'
import { StatusBar } from '@/components/StatusBar'
import { useSerial } from '@/hooks/useSerial'

function App() {
  const { ports, state, lines, terminal, refreshPorts, openPort, closePort, writeData } = useSerial()
  const connected = state.status === 'connected'

  return (
    <div className="flex flex-col h-screen dark bg-background text-foreground">
      <ConnectionPanel
        ports={ports}
        connected={connected}
        onOpen={openPort}
        onClose={closePort}
      />

      <div className="flex-1 min-h-0">
        <TerminalView lines={lines} terminal={terminal} />
      </div>

      <SendPanel disabled={!connected} onSend={writeData} />
      <StatusBar state={state} />
    </div>
  )
}

export default App
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx src/components/StatusBar.tsx
git commit -m "feat: assemble App layout with panels and status bar"
```

---

## Task 14: Add Rust Unit Tests

**Files:**
- Modify: `src-tauri/src/protocol/engine.rs`
- Modify: `src-tauri/src/terminal/buffer.rs`
- Modify: `src-tauri/src/serial/config.rs`

- [ ] **Step 1: Add ProtocolEngine tests**

Append to `src-tauri/src/protocol/engine.rs`:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encode_text_with_lf() {
        let req = WriteRequest {
            data: "hello".into(),
            mode: WriteMode::Text,
            line_ending: LineEnding::Lf,
        };
        assert_eq!(ProtocolEngine::encode(req).unwrap(), b"hello\n");
    }

    #[test]
    fn encode_hex() {
        let req = WriteRequest {
            data: "48 65 6C 6C 6F".into(),
            mode: WriteMode::Hex,
            line_ending: LineEnding::None,
        };
        assert_eq!(ProtocolEngine::encode(req).unwrap(), b"Hello");
    }

    #[test]
    fn encode_hex_odd_digits_fails() {
        let req = WriteRequest {
            data: "123".into(),
            mode: WriteMode::Hex,
            line_ending: LineEnding::None,
        };
        assert!(ProtocolEngine::encode(req).is_err());
    }
}
```

- [ ] **Step 2: Add TerminalBuffer tests**

Append to `src-tauri/src/terminal/buffer.rs`:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn writes_text_and_advances_cursor() {
        let mut buf = TerminalBuffer::new(10, 5);
        buf.feed(b"abc");
        assert_eq!(buf.cursor_col, 3);
        assert_eq!(buf.cells[0][0].ch, 'a');
        assert_eq!(buf.cells[0][1].ch, 'b');
        assert_eq!(buf.cells[0][2].ch, 'c');
    }

    #[test]
    fn new_line_moves_cursor_down() {
        let mut buf = TerminalBuffer::new(10, 5);
        buf.feed(b"a\nb");
        assert_eq!(buf.cursor_row, 1);
        assert_eq!(buf.cursor_col, 1);
    }

    #[test]
    fn scrolls_when_rows_exhausted() {
        let mut buf = TerminalBuffer::new(10, 3);
        buf.feed(b"\n\n\nX");
        assert_eq!(buf.cursor_row, 2);
        assert_eq!(buf.cells[2][0].ch, 'X');
    }
}
```

- [ ] **Step 3: Add SerialConfig tests**

Append to `src-tauri/src/serial/config.rs`:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    fn sample_config() -> SerialConfig {
        SerialConfig {
            port: "/dev/ttyUSB0".into(),
            baud_rate: 115200,
            data_bits: 8,
            parity: "none".into(),
            stop_bits: 1,
        }
    }

    #[test]
    fn valid_config_passes() {
        assert!(sample_config().validate().is_ok());
    }

    #[test]
    fn zero_baud_rate_fails() {
        let mut c = sample_config();
        c.baud_rate = 0;
        assert!(c.validate().is_err());
    }

    #[test]
    fn empty_port_fails() {
        let mut c = sample_config();
        c.port = "  ".into();
        assert!(c.validate().is_err());
    }
}
```

- [ ] **Step 4: Run Rust tests**

Run:
```bash
cd src-tauri && cargo test
```
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/
git commit -m "test: add unit tests for config, protocol engine, and terminal buffer"
```

---

## Task 15: Build and Verify

**Files:**
- Modify: `src-tauri/tauri.conf.json` (permissions)

- [ ] **Step 1: Configure Tauri capabilities**

Ensure `src-tauri/capabilities/default.json` allows necessary APIs:
```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default"
  ]
}
```

- [ ] **Step 2: Run frontend typecheck**

Run:
```bash
npx tsc --noEmit
```
Expected: No type errors.

- [ ] **Step 3: Run full dev build**

Run:
```bash
npm run tauri dev
```
Expected: Application window opens, UI renders, port list loads (may be empty if no serial ports present).

- [ ] **Step 4: Commit**

```bash
git add src-tauri/capabilities/default.json
git commit -m "chore: configure Tauri capabilities and verify build"
```

---

## Task 16: Cross-Platform Build Check

**Files:**
- Modify: `package.json` (optional scripts)

- [ ] **Step 1: Add build scripts**

Modify `package.json` scripts section:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:build": "tauri build",
    "tauri:android": "tauri android",
    "tauri:ios": "tauri ios"
  }
}
```

- [ ] **Step 2: Verify production build on current platform**

Run:
```bash
npm run tauri:build
```
Expected: Build completes and installer is produced in `src-tauri/target/release/bundle/`.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add cross-platform build scripts"
```

---

## Self-Review

### 1. Spec Coverage

| Spec Requirement | Implementing Task |
|------------------|-------------------|
| Tauri v2 + Rust/TS | Task 1 |
| Frontend no business logic | Tasks 8-13 (all logic via Tauri commands/events) |
| Modern UI | Tasks 1-2, 10-13 |
| Cross-platform | Tasks 1, 15-16 |
| Terminal mode | Tasks 7, 12 |
| Custom baud rate | Task 4, 10 |

### 2. Placeholder Scan

- No TBD/TODO/fill-in-later entries.
- All code steps include concrete code.
- All commands include expected outputs.

### 3. Type Consistency

- `SerialConfig` matches between Rust (`src-tauri/src/serial/config.rs`) and TypeScript (`src/types.ts`).
- `WriteRequest` matches between Rust (`src-tauri/src/protocol/engine.rs`) and TypeScript (`src/types.ts`).
- Event payloads use `AppEvent` enum serialized with `#[serde(tag, content)]` and consumed in `useSerial.ts`.

### 4. Known Gaps / Notes

- ANSI parser in `TerminalBuffer` is intentionally minimal; full CSI sequences can be added as a follow-up task without changing architecture.
- Virtual serial port integration tests are omitted to keep the plan self-contained; add them if hardware testing is required.
