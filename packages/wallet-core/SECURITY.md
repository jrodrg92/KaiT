# AgentRail Wallet Security Architecture

## KMS Isolation Principle
The system follows a strict **Split-Responsibility Architecture**:
1. **API/Dashboard**: Can only store and retrieve **Ciphertext** (encrypted secrets). They NEVER possess the Master Key.
2. **Worker**: The ONLY component with access to the KMS Master Key/Credentials. It performs decryption in-memory just before signing.
3. **Database**: Only stores `encrypted_secret`. If the DB is compromised, the mnemonics remain secure without the KMS.

## Threat Model & Mitigations
- **DB Leak**: Mitigated by KMS encryption.
- **API Compromise**: Mitigated by Worker isolation. No decryption logic exists in the API.
- **Memory Scoping**: Secrets are decrypted into short-lived variables and never logged.

## Rotation
KMS Providers must support `rotateKey()`. When rotated, new agents will use the new key, and legacy agents will continue using the old key version (Provider-managed).
