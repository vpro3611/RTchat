# Design Spec: ClamAV Daemon Optimization

## 1. Overview
Optimize the virus scanning process by switching from the slow `clamscan` binary to the ClamAV daemon (`clamd`). This will reduce scan times from ~10s to <500ms.

## 2. Goals
- Transition to ClamAV daemon for near-instant scanning.
- Support both local and remote ClamAV servers via TCP.
- Implement memory-efficient stream scanning (no temporary files).
- maintain compatibility with existing `VirusScannerInterface`.

## 3. Architecture

### 3.1 Components
- **`ClamAVScanner`**: Implementation using the `clamscan` npm package.
- **Config**: Environment-driven settings for host, port, and timeout.

### 3.2 Scanning Pipeline
1. **Request**: Receive file buffer.
2. **Stream**: Convert buffer to a `Readable` stream.
3. **Socket**: Stream data to `clamd` via TCP (default port 3310).
4. **Response**: Parse daemon response (Clean/Infected).

## 4. Configuration (.env)
| Variable | Default | Description |
| :--- | :--- | :--- |
| `CLAMAV_HOST` | `127.0.0.1` | IP of the ClamAV server |
| `CLAMAV_PORT` | `3310` | Port of the ClamAV daemon |
| `CLAMAV_TIMEOUT` | `5000` | Max milliseconds to wait for a scan |

## 5. Security and Resilience
- **Failover**: If the daemon is unreachable, the system will log a critical error and return `false` (fail secure).
- **Timeouts**: strict 5s timeout to prevent hanging the message sending process.
- **Error Mapping**: Map connection errors to internal `VirusScannerError`.

## 6. Implementation Plan
1. Install `clamscan` npm package.
2. Update `ClamAVScanner` to use the new library and TCP streaming.
3. Add configuration logic to read from `.env`.
4. Update unit tests to mock the new library.

## 7. Performance Expectations
- Current (`clamscan` binary): ~10,000ms
- Target (`clamd` daemon): ~50ms - 300ms
