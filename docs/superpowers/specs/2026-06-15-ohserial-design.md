# OhSerial 设计文档

> 一个跨平台、现代化的 Tauri GUI 串口工具。

## 目标

构建一款基于 Tauri v2 的串口调试/终端程序：

- 后端 Rust 处理全部业务逻辑与串口 I/O；前端 TypeScript/React 仅负责渲染与交互。
- 界面现代化、美观，采用深色主题。
- 跨平台：Windows、macOS、Linux。
- 支持终端模式（ANSI 转义序列解析与渲染）。
- 波特率可自由自定义，不限于固定预设。

## 关键决策（基于需求推断）

由于当前处于自动确认模式，以下决策已按最符合需求的方案默认确定：

| 决策项 | 选择 | 理由 |
|--------|------|------|
| Tauri 版本 | v2 | 跨平台能力强，移动端支持可扩展，安全模型更成熟 |
| 前端框架 | React + TypeScript | 生态丰富，组件库成熟 |
| UI 样式 | Tailwind CSS + shadcn/ui | 现代化、可定制、深色主题友好 |
| 串口库 | Rust `serialport` crate | 跨平台、稳定、社区主流 |
| 终端模式 | 后端 ANSI 解析 + 前端网格渲染 | 业务逻辑留在后端，前端只渲染单元格 |
| 终端组件 | 自研轻量终端渲染器 | 避免 xterm.js 这类重型库引入前端业务逻辑 |
| 构建工具 | Vite（Tauri 默认） | 与 Tauri 集成最佳 |

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TS)                   │
│  ConnectionPanel │ SendPanel │ TerminalView │ SettingsPanel  │
│                    仅渲染 UI / 触发 Tauri 命令                 │
└─────────────────────────────┬───────────────────────────────┘
│ Tauri Commands & Events       │
├─────────────────────────────┘
│
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Rust)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ SerialManager │  │ProtocolEngine│  │  TerminalBuffer │   │
│  │  串口打开/关闭 │  │ 数据编码/解码 │  │ ANSI 解析与网格  │   │
│  │ 读写线程管理  │  │ 行尾/Hex/时间戳│  │  差异事件生成   │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 组件职责

### 后端 (Rust)

| 模块 | 文件 | 职责 |
|------|------|------|
| `SerialManager` | `src-tauri/src/serial/manager.rs` | 维护串口连接状态、打开/关闭端口、管理读写线程、配置变更 |
| `SerialPortWorker` | `src-tauri/src/serial/worker.rs` | 在独立线程中读取串口数据，通过通道发送给主线程 |
| `ProtocolEngine` | `src-tauri/src/protocol/engine.rs` | 处理发送数据的编码（文本/Hex/二进制/换行符附加）和接收数据的解析 |
| `TerminalBuffer` | `src-tauri/src/terminal/buffer.rs` | ANSI 转义序列解析、终端网格状态维护、生成差异事件 |
| `TerminalCell` | `src-tauri/src/terminal/cell.rs` | 单个单元格的字符与样式属性 |
| Tauri Commands | `src-tauri/src/commands.rs` | 暴露给前端的命令：列出端口、打开、关闭、写入、设置配置 |
| Tauri Events | `src-tauri/src/events.rs` | 向前端推送：连接状态、收到的数据、终端屏幕更新 |
| App State | `src-tauri/src/state.rs` | 跨 Tauri 命令共享的 SerialManager 句柄 |

### 前端 (React + TypeScript)

| 组件 | 文件 | 职责 |
|------|------|------|
| `App` | `src/App.tsx` | 布局、主题、全局状态 |
| `ConnectionPanel` | `src/components/ConnectionPanel.tsx` | 端口列表、波特率（可自定义）、数据位/校验/停止位、打开/关闭 |
| `SendPanel` | `src/components/SendPanel.tsx` | 输入框、发送按钮、发送历史、Hex/文本切换、换行符选择 |
| `TerminalView` | `src/components/TerminalView.tsx` | 接收数据展示：Raw 日志模式 / 终端模式切换 |
| `SettingsPanel` | `src/components/SettingsPanel.tsx` | 主题、显示选项、日志保存 |
| `StatusBar` | `src/components/StatusBar.tsx` | 连接状态、收发字节统计 |

## 数据流

1. **打开串口**
   - 用户在 `ConnectionPanel` 选择端口、输入自定义波特率、配置参数。
   - 前端调用 `open_port(config)` Tauri 命令。
   - 后端 `SerialManager` 打开串口并启动 `SerialPortWorker` 读线程。
   - 后端通过 `connection_state_changed` 事件通知前端状态变化。

2. **接收数据**
   - `SerialPortWorker` 从串口读取原始字节。
   - 字节流经 `ProtocolEngine` 进行解码/时间戳处理。
   - 在 Raw 模式下，直接通过 `data_received` 事件发送文本行给前端。
   - 在 Terminal 模式下，字节流经 `TerminalBuffer` 解析 ANSI，生成 `terminal_update` 差异事件给前端。

3. **发送数据**
   - 用户在 `SendPanel` 输入内容，选择文本/Hex/换行符。
   - 前端调用 `write_data(request)` 命令。
   - 后端 `ProtocolEngine` 编码后由 `SerialManager` 写入串口。

4. **关闭串口**
   - 用户点击关闭或发生错误。
   - `SerialManager` 停止 worker、关闭端口、清理资源。
   - 发送 `connection_state_changed` 事件。

## 终端模式

OhSerial 提供两种接收显示模式：

### Raw 日志模式

- 按行显示接收到的数据。
- 支持时间戳、Hex 显示、自动换行。
- 适合普通调试场景。

### Terminal 模式

- 后端 `TerminalBuffer` 维护一个 80×24（可配置）的终端网格。
- 解析 ANSI 转义序列：光标移动、颜色、清屏、滚动等基础指令。
- 每次状态变化后，计算与上一帧的差异，通过 `terminal_update` 事件发送。
- 前端 `TerminalView` 根据差异更新 DOM/Canvas 渲染，不解析 ANSI。
- 保证业务逻辑（ANSI 解析）全部在后端完成。

## 波特率自定义

- UI 提供组合输入框：预设列表（9600、19200、38400、57600、115200 等）+ 自由输入。
- 用户输入任意正整数，前端校验范围（例如 1 - 50,000,000）。
- 后端使用 `serialport` crate 的 `open_with_settings` 应用自定义波特率。
- 打开失败时返回具体错误信息到 UI。

## 跨平台

- 串口访问：`serialport` crate 原生支持 Windows（COM）、macOS（/dev/cu.*）、Linux（/dev/tty*）。
- 权限：Linux 需要 dialout 权限；macOS 需要Accessibility/串口权限；Windows 需要驱动正常。
- 打包：Tauri 自带 Windows MSI/nsis、macOS DMG、Linux AppImage/DEB/RPM。

## 错误处理

- 所有 Tauri 命令返回 `Result<T, Error>`，错误包含用户友好的消息。
- 串口读写错误通过 `connection_state_changed` 事件报告。
- 前端统一显示 Toast/Alert。

## 安全

- 串口路径选择由用户在前端完成，不自动打开未知端口。
- Tauri 能力配置（capabilities）仅允许必要权限。
- 后端不对前端传入的数据执行危险操作，仅写入串口。

## 测试策略

| 层级 | 方式 |
|------|------|
| 单元测试 | Rust：`ProtocolEngine`、`TerminalBuffer`、`TerminalCell` 的行为测试 |
| 集成测试 | Rust：使用伪终端/虚拟串口对（如 Linux pty/socat，Windows com0com）测试读写 |
| 前端测试 | React Testing Library + mocked `@tauri-apps/api` |
| E2E | Tauri 官方 WebDriver 或手动跨平台打包验证 |

## 排除项（YAGNI）

- 不实现 SSH/Telnet 支持。
- 不实现脚本引擎/宏录制（可作为后续扩展）。
- 不实现云端同步。
- 不实现多标签页（首期单端口连接，后续可扩展）。

## 后续可扩展

- 多会话/多标签页。
- 数据绘图（波形显示）。
- 脚本自动化（Lua/JS 后端沙箱）。
- 移动端（Tauri v2 Mobile）。
