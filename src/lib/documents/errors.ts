export class DocumentFlowError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "DocumentFlowError";
  }
}

export function isDocumentFlowError(
  error: unknown,
): error is DocumentFlowError {
  return error instanceof DocumentFlowError;
}
