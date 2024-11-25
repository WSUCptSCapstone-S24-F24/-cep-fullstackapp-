import { RefObject } from "react";
import { CalibrationPoint } from "../types/interfaces";


/**
 * Handles static calibration logic for drawing and saving calibration points.
 * @param startXPercent Starting X position as percentage of canvas width
 * @param startYPercent Starting Y position as percentage of canvas height
 * @param intervalXPercent Horizontal interval between points as percentage of canvas width
 * @param intervalYPercent Vertical interval between points as percentage of canvas height
 * @param canvasRef Reference to the canvas
 * @param currentPointIndex Current index of the calibration point
 * @param isPointDisplayed Whether the calibration point is currently displayed
 * @param setCalibrationPoints Function to update the calibration points state
 * @param setCurrentPointIndex Function to update the current point index state
 * @param setIsPointDisplayed Function to toggle the point display state
 * @param leftIrisCoordinate Left iris coordinate
 * @param rightIrisCoordinate Right iris coordinate
 * @param headPose Current head pose (yaw, pitch, roll)
 */
export const performStaticCalibration = (
    startXPercent: number,
    startYPercent: number,
    intervalXPercent: number,
    intervalYPercent: number,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    currentPointIndex: number,
    isPointDisplayed: boolean,
    setCalibrationPoints: (callback: (points: CalibrationPoint[]) => CalibrationPoint[]) => void,
    setCurrentPointIndex: (index: number) => void,
    setIsPointDisplayed: (displayed: boolean) => void,
    leftIrisCoordinate: {x: number; y: number } | null,
    rightIrisCoordinate: {x: number; y: number } | null,
    headPose: {yaw: number; pitch: number; roll: number}
) => { 
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const startX = (startXPercent / 100) * canvasWidth;
    const startY = (startYPercent / 100) * canvasHeight;
    const intervalX = (intervalXPercent / 100) * canvasWidth;
    const intervalY = (intervalYPercent / 100) * canvasHeight;

    const points = [
      { row: 0, col: 0 },
      { row: 0, col: 2 },
      { row: 1, col: 1 },
      { row: 2, col: 0 },
      { row: 2, col: 2 },
      { row: 0, col: 1 },
      { row: 2, col: 1 }  
    ]; // predefined points for calibration

    if (currentPointIndex >= points.length) return;

    const { row, col } = points[currentPointIndex];
    const x = startX + col * intervalX;
    const y = startY + row * intervalY;

    if (isPointDisplayed) {
      // Save the calibration point
        setCalibrationPoints(currentPoints => [
          ...currentPoints,
          {
              irisX: (leftIrisCoordinate && rightIrisCoordinate) ? (leftIrisCoordinate.x + rightIrisCoordinate.x) / 2 : 0,
              irisY: (leftIrisCoordinate && rightIrisCoordinate) ? (leftIrisCoordinate.y + rightIrisCoordinate.y) / 2 : 0,
              screenX: x,
              screenY: y,
              yaw: headPose.yaw,
              pitch: headPose.pitch,
              roll: headPose.roll
          }
      ]);
    
    setCurrentPointIndex(currentPointIndex + 1);
    setIsPointDisplayed(false);

    console.log(`Recorded at: ${x}, ${y}`);
    } else {
        // Draw the calibration point
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        setIsPointDisplayed(true);
        console.log(`Displayed at: ${x}, ${y}`);
    }
} 