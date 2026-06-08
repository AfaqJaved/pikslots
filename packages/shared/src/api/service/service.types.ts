// --- Requests ---

export interface RegisterServiceInput {
  title: string;
  description: string;
  imagesUrls: string[];
  durationInMins: number;
  bufferTimeInMins: number;
  cost: number;
}

// --- Responses ---

export interface RegisterServiceResponse {
  message: 'success';
}
