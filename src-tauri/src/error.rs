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
