
export interface GridImage {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  isActive?: boolean; // Novo: controla se está na grid ou nos removidos
  visible?: boolean;
  // Properties used in interactive editors like FramingTool
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
  layoutMode?: 'grid' | 'auto';
  itemScale?: number;
  targetShape?: 'square' | 'portrait' | 'landscape';
}

// Fixed missing FrameSettings export
export interface FrameSettings {
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding: number;
  shadow: number;
  canvasWidth: number;
  canvasHeight: number;
  frameImageUrl?: string;
  frameImageName?: string;
}
