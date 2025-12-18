
export interface GridImage {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  // Propriedades para o Editor Interativo
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}

export interface GridSettings {
  canvasWidth: number;
  canvasHeight: number;
  columns: number;
  innerSpacing: number;
  outerMargin: number;
  backgroundColor: string;
  isTransparent: boolean;
  backgroundImageUrl?: string;
}

export interface FrameSettings {
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding: number;
  shadow: number;
  frameImageUrl?: string;
  frameImageName?: string;
  canvasWidth: number;
  canvasHeight: number;
}
