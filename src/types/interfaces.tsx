//types.tsx

export interface CalibrationPoint{
    irisX: number,
    irisY: number,
    screenX: number,
    screenY: number;
  }

export interface DotData {
    x: number;
    y: number;
    dx: number;
    dy: number;
    direction: 'U' | 'D' | 'L' | 'R';
  }

export interface VectorData {
    dotIndex: number;
    direction: string;
    dotPosition: {x: number, y: number};
    crosshairPosition: {x: number, y: number};
    userDirection: string;
    dx: number;
    dy: number;
    magnitude?: number;
  }

export interface DPI {
    setDPI: (dpi: number) => void;
}

export interface Box {
  id: number;
  name: string;
  height: string;
  width: string;
  top: string;
  left: string;
  hit: boolean;
}

export interface BoxContainerInformation{
  crosshairPosition: {
      x: number,
      y: number
  };
}

export interface MemoryGameProps{
  crosshairPosition: {
    x: number,
    y: number
  };
  rowSize: number;
  colSize: number;
}

export interface VirtualBoxInfo {
  id: number;
  crosshairPosition: {x: number, y: number};
  name: string;
  height: string;
  width: string;
  top?: string;
  left?: string;
  right?: string;
  onHit: (id: number) => void;
}

export interface MemoryCardBox {
  id: number;
  name: string;
  imageSrc : string;
  height: string;
  width: string;
  top: string;
  left: string;
  hit: boolean;
}

export interface MemoryCardInfo {
  id: number;
  crosshairPosition: {x: number, y: number};
  imageSrc : string;
  name: string;
  height: string;
  width: string;
  top?: string;
  left?: string;
  right?: string;
  onHit: (id: number) => void;
  isHit: boolean;
  isMatched: boolean;
}

export interface ErrorSequenceProps {
  dimensions: { width: number, height: number };
  dpi: number;
  predictedCrosshairPosition: {x: number, y: number}
}

export interface StabilityTestProps {
  dimensions: { width: number, height: number };
  dpi: number;
  predictedCrosshairPositionRef: React.RefObject<{x: number, y: number}>;
  showStabilityTest: boolean;
}

export interface GazeTracingProps {
  dimensions: { width: number, height: number };
  dpi: number;
  predictedCrosshairPositionRef: React.RefObject<{x: number, y: number}>;
  showGazeTracing: boolean;
}