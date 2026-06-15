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
