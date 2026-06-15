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
