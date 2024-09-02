import { FaceMesh } from '@mediapipe/face_mesh'
import * as Facemesh from '@mediapipe/face_mesh'
import * as cam from '@mediapipe/camera_utils'
import Webcam from 'react-webcam'
import { useRef, useEffect, useState } from 'react'
import React from 'react'
import BoxContainer from '../components/box_container'
import ScreenDPI from '../components/screen_dpi'
import ErrorSequenceTest from '../components/error_sequence_test';
import StabilityTest from '../components/stability_test';
import { linearRegression } from '../utils/MathUtils'
import { CalibrationPoint } from '../types/interfaces'

declare global {
  interface Window {
    drawConnectors:any;
  }
}

function Calibration() {
    const [showOverlay, setShowOverlay] = useState(false);//toggles the camera display

  // All of our references
    const webcamRef = useRef<any>(null);
    const canvasRef = useRef<any>(null);
    const clickCanvasRef = useRef<any>(null);
    const crosshairCanvasRef = useRef<any>(null);
    const leftEyeRef = useRef<any>(null);
    const rightEyeRef = useRef<any>(null);
    const headRef = useRef<any>(null);
    const vectorCalibRef = useRef<SVGSVGElement>(null);
    const stabilityVectorRef = useRef<SVGSVGElement>(null);


    const connect = window.drawConnectors;
    var camera = null;
    
    // All variables using a useState should be placed inside a useEffect

    const [dimensions, setDimensions] = useState({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const [clickCoords, setClickCoords] = useState<{x: number; y: number} | null>(null);
    // --Global iris coordinates
    const [leftIrisCoordinate, setLeftIrisCoordinate] = useState<{x: number, y: number} | null>(null);
    const [rightIrisCoordinate, setRightIrisCoordinate] = useState<{x: number, y: number} | null>(null);
    // --Global predicted position
    const [predictedCrosshairPosition, updateCrosshairPosition] = useState({x:0, y: 0});
    // --Our array which holds the set of coordinates for a point
    const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);
    // --Global target practice mode
    const [showBoxContainer, setShowBoxContainer] = useState(false);
    // --Global stability test mode
    const [showStabilityTest, setShowStabilityTest] = useState<boolean>(false);

    const [dpi, setDpi] = useState<number>(96);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);

    const [showErrorTest, setShowErrorTest] = useState(false);
    
    const [isPointDisplayed, setIsPointDisplayed] = useState(false);

    // Update dimensions on window resize
    useEffect(() => {
      function handleResize() {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    // This UseEffect will better handle our useState variables. (Allows them to be changed more responsibly)
    useEffect(() => {
      if (!leftIrisCoordinate || !rightIrisCoordinate || calibrationPoints.length === 0) return;

      const irisPositionToPredict = {
        irisX: (leftIrisCoordinate.x + rightIrisCoordinate.x) / 2,
        irisY: (leftIrisCoordinate.y + rightIrisCoordinate.y) / 2,
      };

      // Calculate coefficients for x,y mapping
      const irisX = calibrationPoints.map(data => data.irisX);
      const screenX = calibrationPoints.map(data => data.screenX);
      const irisY = calibrationPoints.map(data => data.irisY);
      const screenY = calibrationPoints.map(data => data.screenY);

      const coefficientsX = linearRegression(irisX, screenX);
      const coefficientsY = linearRegression(irisY, screenY);

      // These will be our eye tracking crosshair predicted points
      const predictedScreenX = coefficientsX.slope * irisPositionToPredict.irisX + coefficientsX.intercept;
      const predictedScreenY  = coefficientsY.slope * irisPositionToPredict.irisY + coefficientsY.intercept;

      // Which will update to our global variable here
      updateCrosshairPosition({
        x: predictedScreenX,
        y: predictedScreenY,
      });

      // We will draw the crosshair
      if (crosshairCanvasRef.current) {
        drawCrosshair(crosshairCanvasRef.current, predictedScreenX, predictedScreenY);
      }

    }, [leftIrisCoordinate, rightIrisCoordinate, calibrationPoints]); // These are our dependent variables

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
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

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

    // this reference is solely to make sure our predicted crosshair location is being updated in realtime
    // Usually that is the case, but it does not update normally during our stability sequence.
    const predictedCrosshairPositionRef = useRef(predictedCrosshairPosition);

    useEffect(() => {
      predictedCrosshairPositionRef.current = predictedCrosshairPosition;
    }, [predictedCrosshairPosition]); // Update the ref whenever the position changes


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
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
              color: "#F50B0B",
            });
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

          // Saves iris coordinates to a global variable
          applyIrisCoordinates(leftIrisLandmark, rightIrisLandmark);

          // Draw canvases for each iris
          drawZoomedEye(leftEyeRef.current, webcamRef.current.video, leftIrisLandmark.x, leftIrisLandmark.y, 3);
          drawZoomedEye(rightEyeRef.current, webcamRef.current.video, rightIrisLandmark.x, rightIrisLandmark.y, 3);
          drawZoomedEye(headRef.current, webcamRef.current.video, noseLandmark.x, noseLandmark.y, 0.75);
        }
        canvasCtx.restore();
      }

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

    function StaticCalibration(startXPercent: number, startYPercent: number, intervalXPercent: number, intervalYPercent: number, canvasRef: React.RefObject<HTMLCanvasElement>) { 
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
        ]; // points for calibration

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
                  screenY: y
              }
          ]);
        
        setCurrentPointIndex(currentPointIndex + 1);
        setIsPointDisplayed(false);

        console.log(`Recorded at: ${x}, ${y}`);
        console.log(`CalibrationPointsArray: ${JSON.stringify(calibrationPoints, null, 2)}`);
        } else {
            // Draw the calibration point
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
            setIsPointDisplayed(true);
            console.log(`Displayed at: ${x}, ${y}`);
        }

        printIrisCoordinates();
    } 

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'c' || event.key === 'C') {
                StaticCalibration(10, 10, 40, 40, clickCanvasRef); // 10% from the top and left, 40% interval (default)
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    } , [StaticCalibration, isPointDisplayed]);


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
        width={dimensions.width}
        height={dimensions.height}
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
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
        style={{
          position: "absolute",
          marginRight: 'auto',
          marginLeft: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 16, 
          cursor: 'crosshair',
        }}
      />
      <svg ref={vectorCalibRef} style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: 15
      }}></svg>
      <svg ref={stabilityVectorRef} width="100%" height="100%" style={{ 
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 15 }}>
      </svg>
      <Webcam 
        ref={webcamRef}
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
      }}/>
      {showOverlay && (
        <div style={{
            position: "absolute",
            marginRight:'auto',
            marginLeft:'auto',
            left:0,
            right:0,
            textAlign:'center',
            width:640,
            height:480,
            backgroundColor: "white",
            zIndex: 11
        }}></div>
)}

      
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
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 20 }}>
        <ScreenDPI setDPI={setDpi}/>
        <button onClick={() => setShowBoxContainer(!showBoxContainer)}>
          {showBoxContainer ? "Disable Target Practice" : "Enable Target Practice"}
        </button>
        <button onClick={() => setShowStabilityTest(!showStabilityTest)}>
          {showStabilityTest ? "Hide Stability Test" : "Show Stability Test"}
        </button>
        <button onClick={() => setShowErrorTest(!showErrorTest)}>
          {showErrorTest ? "Hide Error Test" : "Show Error Test"}
        </button>
        <button onClick={() => setShowOverlay(!showOverlay)}>
          {showOverlay ? "Toggle Camera Display" : "Toggle Camera Display"}
        </button>
        <p>Start Static Calibration with "C" key</p>
      </div>
      <div>
        {showBoxContainer && <BoxContainer crosshairPosition={predictedCrosshairPosition}/>}
      </div>  
      <div>
        {showErrorTest && <ErrorSequenceTest dimensions={dimensions} dpi={dpi} predictedCrosshairPosition={predictedCrosshairPosition}/>}  
      </div>    
      <div>
        {showStabilityTest && <StabilityTest dimensions={dimensions} dpi={dpi} predictedCrosshairPositionRef={predictedCrosshairPositionRef} showStabilityTest={showStabilityTest}/>}
      </div>
    </div>
    
  );
}

export default Calibration;
