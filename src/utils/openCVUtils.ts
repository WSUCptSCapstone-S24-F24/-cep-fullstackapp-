import cv from "@techstark/opencv-js";
import { globalFocalLengthRef } from './globals';
import { buffer } from "d3";

/**
 * Estimate head pose using landmarks and openCV
 * @param landmarks Facial landmarks
 * @param canvasWidth Width of canvas
 * @param canvasHeight Height of canvas
 * @param setHeadPose Function to update headpose state
 * @param drawOrientationLine Function to draw orientation line
 */

const poseBuffer: { yaw: number; pitch: number; roll: number; time: number }[] = [];

export const estimateHeadPose =(
    landmarks: any,
    canvasWidth: number,
    canvasHeight: number,
    setHeadPose: (pose: {yaw: number; pitch: number; roll: number}) => void,
    drawOrientationLine: (noseLandmark: any, yaw: number, pitch: number) => void,
    focalLength: number = 1,
) => {
    // 3D model points
    const modelPoints = cv.matFromArray(6, 3, cv.CV_64F, [
        0.0, 0.0, 0.0,        // Nose tip
        0.0, -330.0, -65.0,   // Chin
        -225.0, 170.0, -135.0, // Left eye left corner
        225.0, 170.0, -135.0,  // Right eye right corner
        -150.0, -150.0, -125.0, // Left Mouth corner
        150.0, -150.0, -125.0  // Right Mouth corner
    ]);

    // 2D image points
    const imagePoints = cv.matFromArray(6, 2, cv.CV_64F, [
        landmarks[1].x * canvasWidth,
        landmarks[1].y * canvasHeight,   // Nose tip
        landmarks[152].x * canvasWidth,
        landmarks[152].y * canvasHeight, // Chin
        landmarks[33].x * canvasWidth,
        landmarks[33].y * canvasHeight,  // Left eye left corner
        landmarks[263].x * canvasWidth,
        landmarks[263].y * canvasHeight, // Right eye right corner
        landmarks[61].x * canvasWidth,
        landmarks[61].y * canvasHeight,   // Left Mouth corner
        landmarks[291].x * canvasWidth,
        landmarks[291].y * canvasHeight  // Right Mouth corner
    ]);

    // Camera matrix
    focalLength = globalFocalLengthRef.current
    const center = [canvasWidth / 2, canvasHeight / 2];
    const cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [
        focalLength, 0, center[0],
        0, focalLength, center[1],
        0, 0, 1
    ]);

    // Distortion coefficients (assuming no lens distortion)
    const distCoeffs = cv.Mat.zeros(4, 1, cv.CV_64F);

    // Solve PnP
    const rvec = new cv.Mat();
    const tvec = new cv.Mat();
    const success = cv.solvePnP(modelPoints, imagePoints, cameraMatrix, distCoeffs, rvec, tvec);

    if (success) {
        // Convert rotation vector to rotation matrix
        const rotationMatrix = new cv.Mat();
        cv.Rodrigues(rvec, rotationMatrix);

        // Accessing the rotation matrix elements
        const r00 = rotationMatrix.doubleAt(0, 0);
        const r01 = rotationMatrix.doubleAt(0, 1);
        const r02 = rotationMatrix.doubleAt(0, 2);
        const r10 = rotationMatrix.doubleAt(1, 0);
        const r11 = rotationMatrix.doubleAt(1, 1);
        const r12 = rotationMatrix.doubleAt(1, 2);
        const r20 = rotationMatrix.doubleAt(2, 0);
        const r21 = rotationMatrix.doubleAt(2, 1);
        const r22 = rotationMatrix.doubleAt(2, 2);

        // Calculate yaw, pitch, and roll
        const yaw = Math.atan2(-r20, Math.sqrt(r00 ** 2 + r10 ** 2));
        const pitch = -(Math.atan2(-r21, -r22));
        const roll = Math.atan2(r10, r00);

        const adjustedYaw = Math.abs(yaw * 180 / Math.PI) <= 18 ? 0 : yaw;
        const adjustedPitch = Math.abs(pitch * 180 / Math.PI) <= 18 ? 0 : pitch;
        const adjustedRoll = Math.abs(roll*180/Math.PI) <= 18 ? 0 : roll;
        // console.log(yaw*(180/Math.PI))

        //populate buffer
        const currentTime = Date.now()
        poseBuffer.push({
            yaw: adjustedYaw * (180 / Math.PI),
            pitch: adjustedPitch * (180 / Math.PI),
            roll: adjustedRoll * (180 / Math.PI),
            time: currentTime,
        });
        //remove entries older than 200ms
        const cutoffTime = currentTime - 500;
        while (poseBuffer.length && poseBuffer[0].time < cutoffTime) {
            poseBuffer.shift();
        }

        const bufferSize = poseBuffer.length;
        const averagePose = poseBuffer.reduce(
            (acc, pose) => ({
                yaw: acc.yaw + pose.yaw / bufferSize,
                pitch: acc.pitch + pose.pitch / bufferSize,
                roll: acc.roll + pose.roll / bufferSize,
            }),
            { yaw: 0, pitch: 0, roll: 0 }
        );
        console.log(poseBuffer[15])
        setHeadPose(averagePose)
        // setHeadPose({
        //   yaw: yaw * (180 / Math.PI),
        //   pitch: pitch * (180 / Math.PI),
        //   roll: roll * (180 / Math.PI),
        // });

        const noseLandmark = landmarks[4];
        drawOrientationLine(noseLandmark, yaw, pitch);
    }

    // Cleanup
    modelPoints.delete();
    imagePoints.delete();
    cameraMatrix.delete();
    distCoeffs.delete();
    rvec.delete();
    tvec.delete();
}


/**
* Draws the orientation line on the canvas based on pitch and yaw
 * @param noseLandmark
 * @param yaw 
 * @param pitch 
 * @returns 
 */
export const drawOrientationLine = (
    canvas: HTMLCanvasElement,
    noseLandmark: any,
    yaw: any,
    pitch: any
) => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Convert the normalized nose landmark coordinates to actual pixel values
  const noseX = noseLandmark.x * canvas.width;
  const noseY = noseLandmark.y * canvas.height;

  // Length of the orientation line
  const lineLength = 100;

  // Calculate the direction of the line based on yaw and pitch
  const endX = noseX - lineLength * Math.sin(yaw);  // Adjust based on yaw (left-right)
  const endY = noseY - lineLength * Math.sin(pitch); // Adjust based on pitch (up-down)


  // Draw the line from the nose
  ctx.beginPath();
  ctx.moveTo(noseX, noseY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = 'red';  // Color of the orientation line
  ctx.lineWidth = 3;
  ctx.stroke();
}