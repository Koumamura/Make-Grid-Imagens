
export interface GridImage {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface GridSettings {
  canvasWidth: number;
  canvasHeight: number;
  columns: number;
  innerSpacing: number;
  outerMargin: number;
  backgroundColor: string;
}
