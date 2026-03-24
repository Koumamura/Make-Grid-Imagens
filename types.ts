
export type ToolType = 'grid' | 'framing' | 'resizer' | 'alpha-edge' | 'ai-lab';
export type ThemeType = 'dark' | 'light' | 'pastel' | 'midnight';

export type ImageAlignment = 
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface GridImage {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  isActive?: boolean;
  visible?: boolean;
  aboveFrame?: boolean;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
}

export interface FramingPreset {
  id: string;
  name: string;
  timestamp: number;
  settings: FrameSettings;
  extraLayers: {
    id: string;
    dataUrl: string;
    width: number;
    height: number;
    aspectRatio: number;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    name: string;
    visible?: boolean;
    aboveFrame?: boolean;
  }[];
  frameImageDataUrl?: string;
}

export interface HistoryState {
  id: string;
  url: string;
  label: string;
  timestamp: number;
  settingsSnapshot: AISettings;
}

export interface GridSettings {
  canvasWidth: number;
  canvasHeight: number;
  columns: number;
  innerSpacing: number;
  verticalSpacing: number;
  outerMargin: number;
  backgroundColor: string;
  isTransparent: boolean;
  layoutMode: 'grid' | 'auto';
  itemScale: number;
  targetShape: 'square' | 'portrait' | 'landscape';
  exportFilename?: string;
  showCuttingGuides?: boolean;
  showSilhouetteMarks?: boolean;
  guideOffset?: number; 
  guideLength?: number;
  guideThickness?: number;
  guideColor?: string;
  makerMode?: boolean;
  makerRepeat?: number;
  forceOriginalSize?: boolean;
  alignment: ImageAlignment; // Nova propriedade de alinhamento
}

export interface AISettings {
  mode: 'enhance' | 'denoise' | 'restore';
  sharpness: number;
  noiseReduction: number;
  brightness: number;
  contrast: number;
  aiIntensity: number;
  edgeSmoothness: number;
  smartSharpen: boolean;
  highPassRadius: number;
  isAdvancedSharpen: boolean;
  highFreqRadius: number;
  highFreqOpacity: 100,
  lowFreqRadius: 8.0,
  lowFreqOpacity: 50
  exportFilename?: string;
}

export type PreviewQuality = 'fast' | 'moderate' | 'medium' | 'high' | 'ultra';

export interface AlphaEdgeSettings {
  thickness: number;
  softness: number;
  borderScale: number;
  opacity: 100;
  color: string;
  boundaryMode: 'silhouette' | 'geometric';
  geometricShape: 'circle' | 'square' | 'heart' | 'diamond' | 'star';
  shapeOffsetX: number;
  shapeOffsetY: number;
  previewQuality?: PreviewQuality;
  advanced?: AdvancedBorderSettings;
  exportPrefix?: string;
  exportFilename?: string;
}

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
  exportPrefix?: string;
  exportFilename?: string;
}

export interface AdvancedBorderSettings {
  enabled: boolean;
  gridEnabled: boolean;
  scatterEnabled: boolean;
  shapeType: 'circle' | 'square' | 'triangle' | 'x' | 'heart' | 'diamond' | 'none' | 'pata' | 'custom' | 'star';
  customShapeUrl?: string;
  size: number;
  spacingX: number;
  spacingY: number;
  color: string;
  backgroundType: 'solid' | 'gradient';
  bgColor: string;
  gradientAngle: number;
  gradientStops: GradientStop[];
  individualRotation: number;
  globalRotation: number;
  offsetX: number;
  offsetY: number;
  scatterSize: number;
  scatterDensity: number;
  scatterRadiusOffset: number;
  scatterIndividualRotation: number;
}

export interface PatternPreset {
  id: string;
  name: string;
  settings: AdvancedBorderSettings;
  createdAt: number;
}

export interface GradientStop {
  id: string;
  color: string;
  offset: number;
}
