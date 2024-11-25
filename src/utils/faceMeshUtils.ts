import { RefObject } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import { drawConnectors } from "@mediapipe/drawing_utils";
import { estimateHeadPose } from "./openCVUtils";


type Landmark = {
    x: number;
    y: number;
  };

/**
 * Handles results from the MediaPipe FaceMesh API.
 * @param results Results from FaceMesh
 * @param webcamRef Webcam reference
 * @param canvasRef Canvas reference for drawing results
 * @param savedMaxEyelidDistance Current saved max eyelid distance
 * @param setSavedMaxEyelidDistance Function to update the maximum eyelid distance
 * @param setDistanceFromCam Function to update the distance from the camera
 * @param setHeadPose Function to update head pose
 * @param applyIrisCoordinates Function to update iris coordinates
 * @param drawOrientationLine Function to draw orientation lines
 */
export const handleFaceMeshResults = (
    results: any,
    webcamRef: RefObject<any>,
    canvasRef: RefObject<HTMLCanvasElement>,
    savedMaxEyelidDistance: number,
    setSavedMaxEyelidDistance: (distance: number) => void,
    setDistanceFromCam: (distance: number) => void,
    setHeadPose: (pose: { yaw: number; pitch: number; roll: number }) => void,
    applyIrisCoordinates: (
        leftIris: { x: number; y: number },
        rightIris: { x: number; y: number }
    ) => void,
    drawOrientationLine: (
        canvas: HTMLCanvasElement,
        noseLandmark: any,
        yaw: number,
        pitch: number
    ) => void
) => {
    const videoWidth = webcamRef.current?.video.videoWidth;
  const videoHeight = webcamRef.current?.video.videoHeight;

  if (!videoWidth || !videoHeight || !canvasRef.current) return;

  const canvasElement = canvasRef.current;
  const canvasCtx = canvasElement.getContext("2d");
  if (!canvasCtx) return;

  // Set canvas size
  canvasRef.current.width = videoWidth;
  canvasRef.current.height = videoHeight;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    for (const landmarks of results.multiFaceLandmarks) {
      // Draw landmarks
      drawFaceMeshLandmarks(canvasCtx, landmarks);
    }

    const landmarks: Landmark[] = results.multiFaceLandmarks[0];
    const leftIrisIndex = 473;
    const rightIrisIndex = 468;
    const noseIndex = 4;

    const leftTopEyelidIndex = 386;
    const leftBottomEyelidIndex = 374;
    const rightTopEyelidIndex = 159;
    const rightBottomEyelidIndex = 145;

    // Calculate eyelid distance
    const currentMaxEyelidDistance = Math.max(
      landmarks[leftTopEyelidIndex].y - landmarks[leftBottomEyelidIndex].y,
      landmarks[rightTopEyelidIndex].y - landmarks[rightBottomEyelidIndex].y
    );

    if (currentMaxEyelidDistance > savedMaxEyelidDistance) {
      setSavedMaxEyelidDistance(currentMaxEyelidDistance);
    }

    // Save iris coordinates
    const leftIrisLandmark = landmarks[leftIrisIndex];
    const rightIrisLandmark = landmarks[rightIrisIndex];
    applyIrisCoordinates(leftIrisLandmark, rightIrisLandmark);

    // Calculate distance from camera
    const irisLeftMinX = Math.min(...landmarks.map((lm) => lm.x));
    const irisLeftMaxX = Math.max(...landmarks.map((lm) => lm.x));
    const dx = irisLeftMaxX - irisLeftMinX;
    const dX = 11.7; // Constant depending on camera
    const normalizedFocaleX = 1.40625;
    const fx = Math.min(videoWidth, videoHeight) * normalizedFocaleX;
    const dZ = (fx * (dX / dx)) / 10.0;
    setDistanceFromCam(dZ);

    // Estimate head pose and draw orientation line
    estimateHeadPose(
      landmarks,
      canvasElement.width,
      canvasElement.height,
      setHeadPose,
      (noseLandmark, yaw, pitch) =>
        drawOrientationLine(canvasElement, noseLandmark, yaw, pitch)
    );
  }

  canvasCtx.restore();
        
}


/**
 * Draws face mesh landmarks on a given canvas context.
 * @param canvasCtx Canvas rendering context
 * @param landmarks Array of face landmarks
 */
export const drawFaceMeshLandmarks = (
    canvasCtx: CanvasRenderingContext2D,
    landmarks: any[]
  ) => {
    const connections = [
      { type: Facemesh.FACEMESH_TESSELATION, color: "#eae8fd", lineWidth: 1 },
      { type: Facemesh.FACEMESH_RIGHT_EYEBROW, color: "#F50B0B" },
      { type: Facemesh.FACEMESH_LEFT_EYEBROW, color: "#18FF00" },
      { type: Facemesh.FACEMESH_FACE_OVAL, color: "#7367f0" },
      { type: Facemesh.FACEMESH_LIPS, color: "#7367f0" },
      { type: Facemesh.FACEMESH_LEFT_IRIS, color: "#18FF00" },
      { type: Facemesh.FACEMESH_RIGHT_IRIS, color: "#F50B0B" },
    ];
  
    connections.forEach((connection) => {
      drawConnectors(canvasCtx, landmarks, connection.type, {
        color: connection.color,
        lineWidth: connection.lineWidth || 2,
      });
    });
  };