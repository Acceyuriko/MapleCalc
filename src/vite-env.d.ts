/// <reference types="vite/client" />

import type { Worker, WorkerOptions } from 'tesseract.js';

interface Window {
  Tesseract: {
    createWorker(options?: Partial<WorkerOptions>): Promise<Worker>;
  };
}

declare global {
  const ENV: string;
}
