export class KMSError extends Error {
  constructor(message: string, public cause?: any) {
    super(message);
    this.name = "KMSError";
  }
}

export class EncryptionError extends KMSError {}
export class DecryptionError extends KMSError {}
export class AuthenticationError extends KMSError {}
export class ConfigurationError extends KMSError {}
