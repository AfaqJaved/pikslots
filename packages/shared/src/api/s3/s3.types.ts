// --- Requests ---

export interface GetPresignedUploadUrlInput {
  filename: string;
  contentType: string;
  path: string;
}

// --- Responses ---

export interface PresignedUrlResponse {
  url: string;
}
