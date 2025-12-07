export interface GeneratedImage {
  id: string;
  url: string;
  language: string;
  style: string;
  timestamp: number;
}

export interface LanguageOption {
  name: string;
  script: string;
  region: string;
  colors: string[];
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// Augment window for AI Studio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}