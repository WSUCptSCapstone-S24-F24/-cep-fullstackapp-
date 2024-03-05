import { FaceMesh } from '@mediapipe/face_mesh'
import * as Facemesh from '@mediapipe/face_mesh'
import * as cam from '@mediapipe/camera_utils'
import Webcam from 'react-webcam'
import {useRef, useEffect, useState} from 'react'
import React from 'react'
import ReactDOM from 'react-dom'
import VirtualBox from './virtual_box'

declare global {
  interface Window {
    drawConnectors:any;
  }
}

function App() {
  
    const webcamRef = useRef<any>(null);
    const canvasRef = useRef<any>(null);
    const clickCanvasRef = useRef<any>(null);
    const crosshairCanvasRef = useRef<any>(null);

    const leftEyeRef = useRef<any>(null);
    const rightEyeRef = useRef<any>(null);
    const headRef = useRef<any>(null);

    const [clickCoords, setClickCoords] = useState<{x: number; y: number} | null>(null);

    // global iris coordinates
    const [leftIrisCoordinate, setLeftIrisCoordinate] = useState<{x: number, y: number} | null>(null);
    const [rightIrisCoordinate, setRightIrisCoordinate] = useState<{x: number, y: number} | null>(null);

    // Virtual box boolean 
    const [isInside, setIsInside] = useState(false);

  
    const connect = window.drawConnectors;
    var camera = null;

    interface CalibrationPoint{
      irisX: number,
      irisY: number,
      screenX: number,
      screenY: number;
    }

    //LINEAR REGRESSION ALGORITHM START

    // Our array which holds the set of coordinates for a point
    const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);

    const linearRegression = (irisCoords: number[], screenCoords: number[]) => {
      const n = irisCoords.length;
      const sumX = irisCoords.reduce((a,b) => a + b, 0);
      const sumY = screenCoords.reduce((a,b) => a + b, 0);
      const sumXx = irisCoords.reduce((a,b) => a + b * b, 0);
      const sumXy = irisCoords.reduce((a,b,i) => a + b * screenCoords[i], 0);

      const slope = (n * sumXy - sumX * sumY) / (n * sumXx - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      return {slope, intercept};
    }

    // Predicts screen coordinates based on iris coord - > uses linear regression
    const predictScreenPosition = (coefficientsX: {slope: number, intercept: number}, coefficientsY: {slope: number, intercept: number}, 
      irisX: number, irisY: number): { screenX: number, screenY: number } => {
        const predictedScreenX = coefficientsX.slope * irisX + coefficientsX.intercept;
        const predictedScreenY  = coefficientsY.slope * irisY + coefficientsY.intercept;

        return {screenX: predictedScreenX, screenY: predictedScreenY};
      }

    // Main function to call with set of data points
    const calibrateAndPredict = (calibrationData: CalibrationPoint[]) => {
      const irisX = calibrationData.map(data => data.irisX);
      const screenX = calibrationData.map(data => data.screenX);
      const irisY = calibrationData.map(data => data.irisY);
      const screenY = calibrationData.map(data => data.screenY);

      // Calculate coefficients for x and y mappings
      const coefficientsX = linearRegression(irisX, screenX);
      const coefficientsY = linearRegression(irisY, screenY);



      // Predict screen position for each iris position 
      if (leftIrisCoordinate && rightIrisCoordinate){
        const irisPositionToPredict = {irisX: (leftIrisCoordinate.x + rightIrisCoordinate.x) / 2, irisY: (leftIrisCoordinate.y + rightIrisCoordinate.y) / 2};
        const predictedPosition = predictScreenPosition(coefficientsX, coefficientsY, irisPositionToPredict.irisX, irisPositionToPredict.irisY);

        // This is where we will call the draw function
        //console.log(`Predicted Screen Position: (${predictedPosition.screenX}, ${predictedPosition.screenY})`);
        drawCrosshair(crosshairCanvasRef.current, predictedPosition.screenX, predictedPosition.screenY);
      }
        
    }

    // Draws the green crosshair on our screen which will act as our predicted point via eye tracking
    function drawCrosshair(canvas : HTMLCanvasElement, x: number, y:number ) {
      if (!canvas || !x || !y) return;
    
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x, y + 10);
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    //LINEAR REGRESSION ALGORITHM END

    // Will apply new coordinates to global iris coordinates (shortened to tenthousandth place)
    function applyIrisCoordinates(leftIrisCoord: {x: number, y:number}, rightIrisCoord: {x:number, y:number}){
      setLeftIrisCoordinate({
        x: leftIrisCoord.x,
        y: leftIrisCoord.y
      });

      setRightIrisCoordinate({
        x: rightIrisCoord.x,
        y: rightIrisCoord.y
      });
    }

    // Prints our coordinates to console
    function printIrisCoordinates(){
      if (leftIrisCoordinate && rightIrisCoordinate){
        console.log(`Left Iris Coord: ${leftIrisCoordinate.x}, ${leftIrisCoordinate.y}`);
        console.log(`Right Iris Coord: ${rightIrisCoordinate.x}, ${rightIrisCoordinate.y}`);
      }
    }

    // Saves our x,y coordinates on the screen where we click
    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = clickCanvasRef.current?.getBoundingClientRect();
      const x = event.clientX - (rect?.left ?? 0);
      const y = event.clientY - (rect?.top ?? 0);
      setClickCoords({x,y});
      drawOnClick(x,y);
      console.log(`Clicked at: ${x}, ${y}`);

      printIrisCoordinates();
      addCalibrationPointsToArray(x,y);
    }

    // Takes the iris x,y coord and click coords and adds to calibrationPointsArray
    function addCalibrationPointsToArray(clickCoordX: number, clickCoordY: number){
      if (leftIrisCoordinate && rightIrisCoordinate){
        const newPoint = {
          irisX: (leftIrisCoordinate.x + rightIrisCoordinate.x) / 2,
          irisY: (leftIrisCoordinate.y + rightIrisCoordinate.y) / 2,
          screenX: clickCoordX,
          screenY: clickCoordY
        };

        setCalibrationPoints([...calibrationPoints, newPoint]);
      }

      console.log(`CalibrationPointsArray: ${JSON.stringify(calibrationPoints, null, 2)}`);
      console.log(`Calibration Array Length: ${calibrationPoints.length}`)
    }

    // Creates a little red dot at cursor click location
    const drawOnClick = (x: number, y:number) => {
      const canvas = clickCanvasRef.current;
      if(canvas){
        const ctx = canvas.getContext('2d');
        if (ctx){
          //ctx.clearRect(0,0, canvas.width, canvas.height);

          ctx.beginPath();
          ctx.arc(x,y,5,0,2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      }
    };


    function onResults(results:any) {
        // const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        // Set canvas width
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext("2d");

        // Resets face mesh so it can be updated for next image
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.image,0,0,canvasElement.width,canvasElement.height);

        // Create landmarks for each point of interest
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {

          for (const landmarks of results.multiFaceLandmarks) {
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
              color: "#eae8fd",
              lineWidth: 1,
            });
            /*connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
              color: "#F50B0B",
            });*/
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
              color: "#F50B0B",
            });
            /*connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
              color: "#18FF00",
            });*/
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
              color: "#18FF00",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
              color: "#7367f0",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
              color: "#7367f0",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_IRIS, {
              color: "#18FF00",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_IRIS, {
              color: "#F50B0B",
            });
          }

          const landmarks = results.multiFaceLandmarks[0];
          // Get both indexes on the landmarking grid
          const leftIrisIndex = 473;
          const rightIrisIndex = 468;
          const noseIndex = 4;

          // Grabs the x,y coordinates from landmark library so it will follow and track irises on the facemesh
          const leftIrisLandmark = landmarks[leftIrisIndex];
          const rightIrisLandmark = landmarks[rightIrisIndex];
          const noseLandmark = landmarks[noseIndex];

          // If you wish to view each iris coordinates (uncomment the bottom logs)
          if (leftIrisLandmark){
            //console.log(`LEFT IRIS: x=${leftIrisLandmark.x}, y=${leftIrisLandmark.y}`);
          }
          if (rightIrisIndex){
            //console.log(`RIGHT IRIS: x=${rightIrisLandmark.x}, y=${rightIrisLandmark.y}`);
          }

          // Saves iris coordinates to a global variable
          applyIrisCoordinates(leftIrisLandmark, rightIrisLandmark);

          // Draw canvases for each iris
          drawZoomedEye(leftEyeRef.current, webcamRef.current.video, leftIrisLandmark.x, leftIrisLandmark.y, 3);
          drawZoomedEye(rightEyeRef.current, webcamRef.current.video, rightIrisLandmark.x, rightIrisLandmark.y, 3);
          drawZoomedEye(headRef.current, webcamRef.current.video, noseLandmark.x, noseLandmark.y, 0.75);
        }
        canvasCtx.restore();
      }


      // Once we have applied the calibration, we will draw the crosshair on the screen
      calibrateAndPredict(calibrationPoints);

      // This function will crop our webcam and create a zoomed in video at inputted point
      function drawZoomedEye(canvas:HTMLCanvasElement, video: HTMLVideoElement, pointX:number, pointY:number, zoom:number){
        if (!canvas || !video || !pointX || !pointY) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        
        // Enlarges are image to video size
        pointX = pointX * video.videoWidth;
        pointY = pointY * video.videoHeight;

        //console.log(`pointX : ${pointX}, pointY : ${pointY}`);

        // Zooms in our camera to focus on the specific point
        const newWidth = canvas.width / zoom;
        const newHeight = canvas.height / zoom;

        const newX = pointX - newWidth / 2;
        const newY = pointY - newHeight / 2;

        // Reset our canvas (so images are cleared after each frame)
        ctx.clearRect(0,0, canvas.width, canvas.height);

        // Draw video
        ctx.drawImage(
          video,
          newX, newY,
          newWidth, newHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }


      // Instantiate FaceMesh
      useEffect(() => {
        const faceMesh = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        // Apply options for facemesh (ps: refinelandmarks is what enables the option to use iris tracking)
        faceMesh.setOptions({
          maxNumFaces: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          refineLandmarks: true,
        });

        // Update facemesh
        faceMesh.onResults(onResults);

        // Apply facemesh to webcam
        if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null) {
          camera = new cam.Camera(webcamRef.current.video, {
            onFrame: async () => {
              await faceMesh.send({ image: webcamRef.current.video });
            },
            width: 640,
            height: 480,
          });
          camera.start();
        }
      }, []);
      
  return (
    <div>
      <canvas
        ref={crosshairCanvasRef}
        width="1920"
        height="1080"
        style={{
          position: "absolute",
          marginRight: 'auto',
          marginLeft: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 12, 
          cursor: 'crosshair',
        }}
      />
      <canvas
        ref={clickCanvasRef}
        width="1920"
        height="1080"
        onClick={handleCanvasClick}
        style={{
          position: "absolute",
          marginRight: 'auto',
          marginLeft: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 12, 
          cursor: 'crosshair',
        }}
      />

      <Webcam 
        ref={webcamRef}
          style={{
            position:"absolute",
            marginRight:'auto',
            marginLeft:'auto',
            left:0,
            right:0,
            textAlign:'center',
            zIndex:5,
            width:640,
            height:480
      }}/>
      
      <canvas
        ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            position:"absolute",
            marginRight:'auto',
            marginLeft:'auto',
            left:0,
            right:0,
            textAlign:'center',
            zIndex:10,
            width:640,
            height:480
      }}
      />

      <div>
        <VirtualBox onObjectInside={setIsInside} />
      </div>

      <h2 style={{ position: "absolute", top: "420px", left: "150px"}}>Left Eye</h2>
      <canvas 
      ref={leftEyeRef} 
        style={{ 
          position: "absolute", 
          top: "480px", 
          left: "50px", 
          zIndex: 5, 
          width: 320, 
          height: 240 
          }} 
      />

        <h2 style={{ position: "absolute", top: "420px", right: "160px"}}>Right Eye</h2>
        <canvas
         ref={rightEyeRef} 
          style={{ 
            position: "absolute", 
            top: "480px", 
            right: "50px", 
            zIndex: 5, 
            width: 320, 
            height: 240 
            }}
        />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('app'));