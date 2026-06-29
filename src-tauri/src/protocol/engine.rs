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
    if !cleaned.len().is_multiple_of(2) {
        return Err("hex string must have even number of digits".into());
    }
    (0..cleaned.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&cleaned[i..i + 2], 16).map_err(|e| e.to_string()))
        .collect()
}

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
