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
import GazeTracing from '../components/gaze_tracing';
import useRefreshRate from '../components/get_refresh_rate'
import MemoryGame from '../components/memory_game';
import { linearRegression } from '../utils/MathUtils'
import { CalibrationPoint } from '../types/interfaces'
import * as d3 from 'd3';
import cv, { cols } from "@techstark/opencv-js"
import { loadDataFile } from '../utils/cvDataFile'

declare global {
  interface Window {
    drawConnectors:any;
  }
}

let faceCascade: cv.CascadeClassifier;

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
    const { refreshRate } = useRefreshRate(1000); //max refresh rate over 1 second, might need to change 


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
    //predicted position for averages
    //this is not cool but could probably be fixed later kinda easily
    interface VectorDataB {
      x: number;
      y: number;
      dotIndex?: number;
      direction?: string;
      dotPosition?: { x: number; y: number };
      crosshairPosition?: { x: number; y: number };
    }

    const [lastCrosshairPositions, setLastCrosshairPositions] = useState<VectorDataB[]>([]);
    const [averageCrosshairPosition, setAverageCrosshairPosition] = useState({x:0, y: 0});
    const averageCrosshairPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const [drawPredicted, setDrawPredicted] = useState<boolean>(false);
    const [drawAverage, setDrawAverage] = useState<boolean>(true);
    const [drawPrevious, setDrawPrevious] = useState<boolean>(false);
    const [drawCursor, setDrawCursor] = useState<boolean>(false);
    // --Our array which holds the set of coordinates for a point
    const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);
    // --Global target practice mode
    const [showBoxContainer, setShowBoxContainer] = useState(false);
    // --Global stability test mode
    const [showStabilityTest, setShowStabilityTest] = useState<boolean>(false);
    // = Gaze tracing
    const [showGazeTracing, setShowGazeTracing] = useState(false);
    //ellipses for gaze cursr
    const[ellipseSVG, setEllipseSVG] = useState<{
      centerX: number;
      centerY: number;
      ellipseWidth: number;
      ellipseHeight: number;
      angleInDeg: number;
    }>({
      centerX: 0,
      centerY: 0,
      ellipseWidth: 0,
      ellipseHeight: 0,
      angleInDeg: 0
    });

    const [ellipseSVG2, setEllipseSVG2] = useState<{
      centerX: number;
      centerY: number;
      ellipseWidth: number;
      ellipseHeight: number;
      angleInDeg: number;
    }>({
      centerX: 0,
      centerY: 0,
      ellipseWidth: 0,
      ellipseHeight: 0,
      angleInDeg: 0
    });

    const [dpi, setDpi] = useState<number>(96);
    const [distanceFromCam, setDistanceFromCam] = useState(0);
    const [cameraFOV, setCameraFOV] = useState(0);
    const [focalLength, setFocalLength] = useState(0);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);

    const [showErrorTest, setShowErrorTest] = useState(false);
    
    const [isPointDisplayed, setIsPointDisplayed] = useState(false);
    
    const [headPose, setHeadPose] = useState({
      yaw: 0,
      pitch: 0,
      roll: 0,
    });

    const [showMemoryGame, setShowMemoryGame] = useState(false);

    // Row and col size for Memory Game
    const [rowSize, setRowSize] = useState(4);
    const [colSize, setColSize] = useState(4);

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
      const yaw = calibrationPoints.map(data => data.yaw);
      const pitch = calibrationPoints.map(data => data.pitch);
      const roll = calibrationPoints.map(data => data.roll);

      const coefficientsX = linearRegression(irisX, screenX);
      const coefficientsY = linearRegression(irisY, screenY);

      // These will be our eye tracking crosshair predicted points
      const predictedScreenX =
      coefficientsX.slope * irisPositionToPredict.irisX + coefficientsX.intercept;

      const predictedScreenY =
      coefficientsY.slope * irisPositionToPredict.irisY + coefficientsY.intercept;

      // YAW Compensation (Trigonometric)
      const yawRadians = headPose.yaw * (Math.PI / 180);
      const yawScale = 2.0;  // higher the number, the quicker the response. (more change for over adjusing)
      const yawCompensation = Math.tan(yawRadians) * focalLength * yawScale;

      // PITCH Compensation 
      const pitchRadians = headPose.pitch * (Math.PI / 180);
      const pitchScale = 1.0;
      const pitchCompensation = Math.tan(pitchRadians) * focalLength * pitchScale;

      // Apply the compensation
      const correctedScreenX = predictedScreenX - yawCompensation;
      const correctedScreenY = predictedScreenY + pitchCompensation;
      console.log(`YAW: Compensation: ${yawCompensation}, Position: ${predictedScreenX}, Corrected: ${correctedScreenX}`);
      console.log(`PITCH: Compensation: ${pitchCompensation}, Position: ${predictedScreenY}, Corrected: ${correctedScreenY}`);


      // Which will update to our global variable here
      updateCrosshairPosition({
        x: correctedScreenX,
        y: correctedScreenY,
      });

      // We will draw the crosshair
      if (crosshairCanvasRef.current) {
        drawCrosshair(crosshairCanvasRef.current, correctedScreenX, correctedScreenY);
      }

    }, [leftIrisCoordinate, rightIrisCoordinate, calibrationPoints, headPose, focalLength]); // These are our dependent variables

    // Draws the green crosshair on our screen which will act as our predicted point via eye tracking
    function drawCrosshair(canvas : HTMLCanvasElement, x: number, y:number ) {
      if (!canvas || !x || !y) return;
    
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if(!drawPredicted) return;
      console.log("drawing predicted")

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
          screenY: clickCoordY,
          yaw: headPose.yaw,
          pitch: headPose.pitch,
          roll: headPose.roll
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

    //average crosshair position logic
    useEffect(() => {
      if (predictedCrosshairPosition && refreshRate) {
          setLastCrosshairPositions(prevPositions => {
              const newPosition: VectorDataB = {
                  x: predictedCrosshairPosition.x,
                  y: predictedCrosshairPosition.y,
                  dotIndex: 0,
                  direction: '',
                  dotPosition: { x: 0, y: 0 },
                  crosshairPosition: { x: predictedCrosshairPosition.x, y: predictedCrosshairPosition.y },
              };
              //keep the last n positions
              // const n = 20 //config
              // const stddevs = 1 //config
              // const recentWeight = 2, olderWeight = 1; //config
              //this might be bad but it seems to work good on 165hz and I think it should be good on 360hz too
              const n = refreshRate/10 //config
              const stddevs = refreshRate/150 //config
              const recentWeight = 2, olderWeight = 1; //config
              console.log("n :", n, "stddevs: ", stddevs)

              const updatedPositions = [...prevPositions, newPosition].slice(-n);

              //exclude outliers
              const meanX = updatedPositions.reduce((sum, pos) => sum + pos.x, 0) / updatedPositions.length;
              const meanY = updatedPositions.reduce((sum, pos) => sum + pos.y, 0) / updatedPositions.length;

              const stdDevX = Math.sqrt(updatedPositions.reduce((sum, pos) => sum + Math.pow(pos.x - meanX, 2), 0) / updatedPositions.length);
              const stdDevY = Math.sqrt(updatedPositions.reduce((sum, pos) => sum + Math.pow(pos.y - meanY, 2), 0) / updatedPositions.length);

              //ignore outliers however many stddevs away
              const filteredPositions = updatedPositions.filter(pos => Math.abs(pos.x - meanX) <= stddevs * stdDevX && Math.abs(pos.y - meanY) <= stddevs * stdDevY);

               //weighted average: give 2x weight to the 10 most recent positions
              let weightedSumX = 0, weightedSumY = 0, totalWeight = 0;

              filteredPositions.forEach((pos, index) => {
                  const weight = index >= filteredPositions.length - n/2 ? recentWeight : olderWeight;
                  weightedSumX += pos.x * weight;
                  weightedSumY += pos.y * weight;
                  totalWeight += weight;
              });

              //get the average of the last n positions
              if (updatedPositions.length > 0) {
                  const avgX = updatedPositions.reduce((sum, pos) => sum + pos.x, 0) / updatedPositions.length;
                  const avgY = updatedPositions.reduce((sum, pos) => sum + pos.y, 0) / updatedPositions.length;
  
                  setAverageCrosshairPosition({ x: avgX, y: avgY });
                  averageCrosshairPositionRef.current = averageCrosshairPosition; //the blue crosshair dot we draw on the screen
              }

              // gaze cursor
              if(drawCursor){ 
                // find the two furthest points a and b
                let pointA = { x: 0, y: 0 };
                let pointB = {x:0, y:0};
                let maxDistance = 0;

                for (let i = 0; i < updatedPositions.length; i++) {
                  for (let j = i + 1; j < updatedPositions.length; j++) {
                    const distance = Math.sqrt(
                      Math.pow(updatedPositions[j].x - updatedPositions[i].x, 2) +
                      Math.pow(updatedPositions[j].y - updatedPositions[i].y, 2)
                    );
                    if (distance > maxDistance) {
                      maxDistance = distance;
                      pointA = updatedPositions[i];
                      pointB = updatedPositions[j];
                    }
                  }
                }
                // get the angle between those points so we can tilt the ellpise 
                const angle = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x);
                const angleInDeg = angle * (180 / Math.PI); //for drawing the ellipse with svg

                // calculate the perpendicular angle so we can calculate the ellipse height
                const perpendicularAngle = angle + Math.PI / 2;
                // project the points onto the perpendicular axis (THIS IS CRAZY)
                let minProj = Infinity;
                let maxProj = -Infinity;
                //find the two furthest points on that projection to get the ellipse height
                for (let i = 0; i < updatedPositions.length; i++) {
                  const projection =
                    updatedPositions[i].x * Math.cos(perpendicularAngle) +
                    updatedPositions[i].y * Math.sin(perpendicularAngle);

                  if (projection < minProj) {
                    minProj = projection;
                  }
                  if (projection > maxProj) {
                    maxProj = projection;
                  }
                }

                // calculate the ellipse parameters (center, width, height)
                const centerX = (pointA.x + pointB.x) / 2;
                const centerY = (pointA.y + pointB.y) / 2;
                const ellipseWidth = maxDistance; // distance between pointA and pointB
                const ellipseHeight = maxProj - minProj; // distance along the perpendicular axis

                // draw the ellipse
                if (crosshairCanvasRef.current) {
                  if(ellipseSVG)setEllipseSVG2(ellipseSVG)
                  setEllipseSVG({centerX, centerY, ellipseWidth, ellipseHeight, angleInDeg} )
                  
                  //ctx didnt work well. it would sometimes decide to not draw anything so the ellipse would flash on screen a lot. 

                  // const canvas = crosshairCanvasRef.current;
                  // const ctx = canvas.getContext('2d');
                  // if (ctx) {
                  //   console.log("drawing")
                  //   ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
                  //   ctx.save(); // Save the current canvas state

                  //   ctx.translate(centerX, centerY);
                  //   ctx.rotate(angle);
                  //   ctx.beginPath();
                  //   ctx.ellipse(0, 0, ellipseWidth / 2, ellipseHeight / 2, 0, 0, 2 * Math.PI);
                  //   ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
                  //   ctx.lineWidth = 2;
                  //   ctx.stroke();

                  //   ctx.restore();
                  // }
                }
              }

              return updatedPositions;
          });
      }
  }, [predictedCrosshairPosition]);
  
  //key press handler, currently used to show detailed crosshair info
  useEffect(() => {
    // Function to handle key presses
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '1') {
        setDrawAverage(drawAverage => !drawAverage);
      } else if (event.key === '2') {
        setDrawPredicted(drawPredicted => !drawPredicted);
      } else if (event.key === '3') {
      setDrawPrevious(drawPrevious => !drawPrevious);
      } else if (event.key === '4') {
        setDrawCursor(drawCursor => !drawCursor);
      }
    };

    // Add event listener for keydown events
    window.addEventListener('keydown', handleKeyPress);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []); // Empty dependency array ensures this effect runs only once
  //debug: draw average crosshair and previous 5 points
  useEffect(() => {
    const svg = d3.select(vectorCalibRef.current);

    //remove existing crosshair points to prevent duplicates
    svg.selectAll('.crosshair-point').remove();
    svg.selectAll('.average-crosshair-point').remove();
    svg.selectAll('.gaze-cursor-point').remove();

     //draw last n crosshair positions
     if(drawPrevious){
     svg.selectAll('.crosshair-point')
     .data(lastCrosshairPositions)
     .enter()
     .append('circle')
     .attr('class', 'crosshair-point')
     .attr('cx', d => (d.crosshairPosition ? d.crosshairPosition.x : 0))
     .attr('cy', d => (d.crosshairPosition ? d.crosshairPosition.y : 0))
     .attr('r', 2)
     .style('fill', 'red');
     }

    //draw average crosshair position
    if (drawAverage && averageCrosshairPosition) {
      svg.append('circle')
        .attr('class', 'average-crosshair-point')
        .attr('cx', averageCrosshairPosition.x)
        .attr('cy', averageCrosshairPosition.y)
        .attr('r', 5)
        .style('fill', 'blue');
    }

    const ellipses = [ellipseSVG, ellipseSVG2]
    //draw gaze cursor
    if(drawCursor)
    {
      svg.selectAll('ellipse')
        .data([ellipses]) // Use your data here
        .join('ellipse')
        .attr('class', 'gaze-cursor-point')
        .attr('cx', d => d[0].centerX)
        .attr('cy', d => d[0].centerY)
        .attr('rx', d => d[0].ellipseWidth / 2)
        .attr('ry', d => d[0].ellipseHeight / 2)
        .attr('transform', d => `rotate(${d[0].angleInDeg}, ${d[0].centerX}, ${d[0].centerY})`)
        .style('fill', 'rgba(0, 0, 255, 0.1)')
        // .transition()
        // .duration(7)
        // .ease(d3.easeCubicInOut)
        // .attr('cx', d => d[1].centerX)
        // .attr('cy', d => d[1].centerY)
        // .attr('rx', d => d[1].ellipseWidth / 2)
        // .attr('ry', d => d[1].ellipseHeight / 2)
        // .attr('transform', d => `rotate(${d[1].angleInDeg}, ${d[1].centerX}, ${d[1].centerY})`);
    }
  }, [dimensions, lastCrosshairPositions, averageCrosshairPosition]); // Dependencies for re-running the effect


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

      var irisLeftMinX = -1;
      var irisLeftMaxX = -1;

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

        for (const point of Facemesh.FACEMESH_LEFT_IRIS) {
          var point0 = landmarks[point[0]];
          
          if (irisLeftMinX == -1 || point0.x * videoWidth < irisLeftMinX) {
            irisLeftMinX = point0.x * videoWidth;
          }
          if (irisLeftMaxX == -1 || point0.x * videoWidth > irisLeftMaxX) {
            irisLeftMaxX = point0.x * videoWidth;
          }
        }
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

      var dx = irisLeftMaxX - irisLeftMinX;
      var dX = 11.7;
      var normalizedFocaleX = 1.40625; //It means camera focal. It works well but we can change it depends on the camera.
      var fx = Math.min(videoWidth, videoHeight) * normalizedFocaleX;
      var dZ = (fx * (dX / dx))/10.0;
      setDistanceFromCam(dZ);

      // We will calculate FOV of camera here
      const cameraSensorSize = 0.6; // We will use this as universal camera size
      let newCameraFov = ((2 * Math.atan(cameraSensorSize / (2 * dZ))) * (180/Math.PI)) * 100;
      setCameraFOV(newCameraFov);

      // Set focal length with camera FOV. This is used for head compensation
      setFocalLength(screen.width / (2 * Math.tan((newCameraFov / 2.0) * Math.PI / 180.0)));

      estimateHeadPose(landmarks);      
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
                  screenY: y,
                  yaw: headPose.yaw,
                  pitch: headPose.pitch,
                  roll: headPose.roll
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
                StaticCalibration(3, 3, 45, 45, clickCanvasRef); // 10% from the top and left, 40% interval (default)
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
      const gazetraceprop = { //idk why this is needed but it is
        dimensions: dimensions,
        dpi: dpi,
        predictedCrosshairPositionRef: averageCrosshairPositionRef,
        showGazeTracing: showGazeTracing,
      }

    function estimateHeadPose(landmarks: any) {
      const noseIndex = 4;
      const noseLandmark = landmarks[noseIndex];
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
          landmarks[1].x * canvasRef.current.width, landmarks[1].y * canvasRef.current.height,   // Nose tip
          landmarks[152].x * canvasRef.current.width, landmarks[152].y * canvasRef.current.height, // Chin
          landmarks[33].x * canvasRef.current.width, landmarks[33].y * canvasRef.current.height,  // Left eye left corner
          landmarks[263].x * canvasRef.current.width, landmarks[263].y * canvasRef.current.height, // Right eye right corner
          landmarks[61].x * canvasRef.current.width, landmarks[61].y * canvasRef.current.height,   // Left Mouth corner
          landmarks[291].x * canvasRef.current.width, landmarks[291].y * canvasRef.current.height  // Right Mouth corner
      ]);

      // Camera matrix
      const focalLength = canvasRef.current.width;
      const center = [canvasRef.current.width / 2, canvasRef.current.height / 2];
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
          setHeadPose({
            yaw: yaw * (180 / Math.PI),
            pitch: pitch * (180 / Math.PI),
            roll: roll * (180 / Math.PI),
          });

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

  function drawOrientationLine(noseLandmark:any, yaw:any, pitch:any) {
    const canvas = canvasRef.current;
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
        <button onClick={() => setShowMemoryGame(!showMemoryGame)}>
          {showMemoryGame ? "Hide Memory Game" : "Show Memory Game"}
        </button>
        <button onClick={() => setShowOverlay(!showOverlay)}>
          {showOverlay ? "Toggle Camera Display" : "Toggle Camera Display"}
        </button>
        <button onClick={() => setShowGazeTracing(!showGazeTracing)}>
          {showGazeTracing ? "Leave Gaze Tracing" : "Enter Gaze Tracing"}
        </button>
        <div>
          <label> Row Size </label>
          <input
            type="number"
            value={rowSize}
            onChange={(event) => setRowSize(Number(event.target.value))}
          /> 
          <label> Col Size </label>
          <input
            type="number"
            value={colSize}
            onChange={(event) => setColSize(Number(event.target.value))}
          /> 
        </div>
        <p>Start Static Calibration with "C" key</p>
      </div>
      <div>
        {showBoxContainer && <BoxContainer crosshairPosition={averageCrosshairPosition}/>}
      </div>  
      <div>
        {showErrorTest && <ErrorSequenceTest dimensions={dimensions} dpi={dpi} predictedCrosshairPosition={averageCrosshairPosition}/>}  
      </div>    
      <div>
        {showStabilityTest && <StabilityTest dimensions={dimensions} dpi={dpi} predictedCrosshairPositionRef={averageCrosshairPositionRef} showStabilityTest={showStabilityTest}/>}
      </div>
      <div>
        {showGazeTracing && <GazeTracing {...gazetraceprop} />}
      </div>
      <div>
        {showMemoryGame && <MemoryGame crosshairPosition={averageCrosshairPosition} rowSize={rowSize} colSize={colSize} DPI={dpi}/>}  
      </div>
      <div>
        <p>Yaw (left-right): {headPose.yaw.toFixed(2)}°</p>
        <p>Pitch (up-down): {headPose.pitch.toFixed(2)}°</p>
        <p>Roll (tilt): {headPose.roll.toFixed(2)}°</p>
        <p>Distance : {distanceFromCam.toFixed(2)} cm</p>
        <p>Camera FOV : {cameraFOV.toFixed(2)}°</p>
        <p>Focal Length : {focalLength.toFixed(2)} cm</p>

      </div>
    </div>
    
    
  );
}

export default Calibration;
