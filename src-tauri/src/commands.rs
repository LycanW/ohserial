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
