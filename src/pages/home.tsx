import { FaceMesh } from '@mediapipe/face_mesh'
import * as Facemesh from '@mediapipe/face_mesh'
import * as cam from '@mediapipe/camera_utils'
import Webcam from 'react-webcam'
import { useRef, useEffect, useState } from 'react'
import React from 'react'
import BoxContainer from '../components/box_container'
import ScreenDPI from '../components/screen_dpi'
import CameraFOV from '../components/camera_fov'
import ErrorSequenceTest from '../components/error_sequence_test';
import StabilityTest from '../components/stability_test';
import GazeTracing from '../components/gaze_tracing';
import useRefreshRate from '../components/get_refresh_rate'
import MemoryGame from '../components/memory_game';
import { linearRegression } from '../utils/MathUtils'
import { CalibrationPoint } from '../types/interfaces'
import * as d3 from 'd3';
import cv, { cols } from "@techstark/opencv-js"
import { estimateHeadPose, drawOrientationLine } from "../utils/openCVUtils";
import { performStaticCalibration, performManualCalibration } from '../utils/calibrationUtils';
import { handleFaceMeshResults } from '../utils/faceMeshUtils';
import { useFocalLength } from '../utils/useFocalLength';
import { setGlobalFocalLengthRef } from '../utils/globals';

declare global {
  interface Window {
    drawConnectors:any;
  }
}

let faceCascade: cv.CascadeClassifier;
let globalFocalLengthRef: React.MutableRefObject<number> | null = null;

function Home() {
    const [showOverlay, setShowOverlay] = useState(false);//toggles the camera display

  // All of our references
    const webcamRef = useRef<any>(null);
    const canvasRef = useRef<any>(null);
    const clickCanvasRef = useRef<any>(null);
    const crosshairCanvasRef = useRef<any>(null);
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
    const [savedMaxEyelidDistance, setSavedMaxEyelidDistance] = useState<number>(0.000);
    const [eyelidDistances, setEyelidDistances] = useState<number[]>([]);
    const [stddevscale, setstddevscale] = useState<number>(1); //the stdev scale changes during blinks to compensate
    const [isBlinkCooldown, setIsBlinkCooldown] = useState(false);
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
    const [filteredLastCrosshairPositions, setFilteredLastCrosshairPositions] = useState<VectorDataB[]>([]);
    const [averageCrosshairPosition, setAverageCrosshairPosition] = useState({x:0, y: 0});
    const averageCrosshairPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const [compensatedCrosshairPosition, setCompensatedCrosshairPosition] = useState({ x: 0, y: 0 });

    const [drawPredicted, setDrawPredicted] = useState<boolean>(false);
    const [drawAverage, setDrawAverage] = useState<boolean>(true);
    const [drawRawArray, setDrawRawArray] = useState<boolean>(false);
    const [drawRawCursor, setDrawRawCursor] = useState<boolean>(false);
    const [DrawBlinkStatus, setDrawBlinkStatus] = useState<boolean>(false);
    const [isBlinking, setIsBlinking] = useState<boolean>(false);
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

    const [dpi, setDpi] = useState<number>(96);
    const [distanceFromCam, setDistanceFromCam] = useState(0);
    const [focalLength, setFocalLength] = useState(window.innerWidth);
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

    // Toggle UI
    const [showUIControls, setShowUIControls] = useState(true);

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

    function getDynamicYawScale(yawAngle: number): number {
      // Increase scaling for larger yaw angles
      return Math.abs(yawAngle) > 20 ? 2.0 : Math.max(1.5, 0.05 * Math.abs(yawAngle) + 1); // Base: return Math.abs(yawAngle) > 20 ? 2.0 : Math.max(1.5, 0.05 * Math.abs(yawAngle) + 1
    }
    
    function getDynamicPitchScale(pitchAngle: number): number {
      // Increase scaling for larger pitch angles
      return Math.abs(pitchAngle) > 10 ? 1.0 : Math.max(0.4, 0.02 * Math.abs(pitchAngle) + 0.4); // Base: return Math.abs(pitchAngle) > 5 ? 1.0 : Math.max(0.5, 0.03 * Math.abs(pitchAngle) + 0.5
    }

    // This UseEffect will better handle our useState variables. (Allows them to be changed more responsibly)
    useEffect(() => {
      if (!refreshRate || !leftIrisCoordinate || !rightIrisCoordinate || calibrationPoints.length === 0) return;

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
      const predictedScreenX =
      coefficientsX.slope * irisPositionToPredict.irisX + coefficientsX.intercept;

      const predictedScreenY =
      coefficientsY.slope * irisPositionToPredict.irisY + coefficientsY.intercept;

      const adaptiveYawScale = getDynamicYawScale(headPose.yaw);
      const adaptivePitchScale = getDynamicPitchScale(headPose.pitch);

      // YAW Compensation (Trigonometric)
      const yawRadians = headPose.yaw * (Math.PI / 180);
      const yawCompensation = Math.tan(yawRadians) * focalLength * adaptiveYawScale;

      // PITCH Compensation 
      const pitchRadians = headPose.pitch * (Math.PI / 180);
      const pitchCompensation = Math.tan(pitchRadians) * focalLength * adaptivePitchScale;

      // Apply the compensation
      const correctedScreenX = predictedScreenX - yawCompensation;
      const correctedScreenY = predictedScreenY + pitchCompensation;
      setCompensatedCrosshairPosition({ x: correctedScreenX, y: correctedScreenY })
      console.log(`YAW: Compensation: ${yawCompensation}, Position: ${predictedScreenX}, Corrected: ${correctedScreenX}, Scale: ${adaptiveYawScale}`);
      console.log(`PITCH: Compensation: ${pitchCompensation}, Position: ${predictedScreenY}, Corrected: ${correctedScreenY}, Scale: ${adaptivePitchScale}`);


      const n = refreshRate * 0.8; //storing eyelid distances over the last .3s
      setEyelidDistances((prevDistances) => {
        const newDistances = [...prevDistances, savedMaxEyelidDistance];

        //limit the saved distances to just the ones over the past whatever fraction of a second
        if (newDistances.length > n) {
          newDistances.shift();
        }

        return newDistances;
      });
      //blinkthreshold is now the average eyelid distance over the past 0.3s
      const blinkThreshold = eyelidDistances.reduce((acc, val) => acc + val, 0) / eyelidDistances.length;

      if (isBlinkCooldown) return; // Skip check if in cooldown
      //if the eyelid distance changed a lot over the period, its a blink
      console.log(isBlinkCooldown)
      if (savedMaxEyelidDistance < (blinkThreshold * 0.75)) { //config: higher multiplier = more blinks detected. must be less than 1
        setstddevscale(0.2); //so the crosshair doesnt freak out as much during blinks
        setIsBlinking(true)
        setIsBlinkCooldown(true);
        setTimeout(() => {
          setIsBlinkCooldown(false); // re-enable check after 0.12 seconds
        }, 120);
      } 
      else {
        setstddevscale(1);
        setIsBlinking(false)
        updateCrosshairPosition({
          x: predictedScreenX,
          y: predictedScreenY,
        });
      }

      // We will draw the crosshair
      if (crosshairCanvasRef.current) {
        drawCrosshair(crosshairCanvasRef.current, correctedScreenX, correctedScreenY);
      }

    }, [leftIrisCoordinate, rightIrisCoordinate, calibrationPoints, savedMaxEyelidDistance, isBlinkCooldown, focalLength]); // These are our dependent variables


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
      ctx.strokeStyle = 'blue';
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
      if (compensatedCrosshairPosition && refreshRate) {
          setLastCrosshairPositions(prevPositions => {
              const newPosition: VectorDataB = {
                  x: compensatedCrosshairPosition.x,
                  y: compensatedCrosshairPosition.y,
                  dotIndex: 0,
                  direction: '',
                  dotPosition: { x: 0, y: 0 },
                  crosshairPosition: { x: compensatedCrosshairPosition.x, y: compensatedCrosshairPosition.y },
              };
              const n = refreshRate/10 //config
              const stddevs = stddevscale //config: lower stddevs = stricter filter
              const recentWeight = 2, olderWeight = 1; //config
              console.log("stddevs: ", stddevs)

              const updatedPositions = [...prevPositions, newPosition].slice(-n);

              //get stdevs for our array
              const meanX = updatedPositions.reduce((sum, pos) => sum + pos.x, 0) / updatedPositions.length;
              const meanY = updatedPositions.reduce((sum, pos) => sum + pos.y, 0) / updatedPositions.length;

              const stdDevX = Math.sqrt(updatedPositions.reduce((sum, pos) => sum + Math.pow(pos.x - meanX, 2), 0) / updatedPositions.length);
              const stdDevY = Math.sqrt(updatedPositions.reduce((sum, pos) => sum + Math.pow(pos.y - meanY, 2), 0) / updatedPositions.length);

              //only keep points within however many stddevs
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
              setFilteredLastCrosshairPositions(updatedPositions)
              // raw gaze cursor
              if(drawRawCursor){ 
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
                  setEllipseSVG({centerX, centerY, ellipseWidth, ellipseHeight, angleInDeg} )
                }
              }   

              return updatedPositions;
          });
      }
  }, [compensatedCrosshairPosition, stddevscale]);
  

  //debug: draw average crosshair and previous 5 points
  useEffect(() => {
    const svg = d3.select(vectorCalibRef.current);

    //remove existing crosshair points to prevent duplicates
    svg.selectAll('.crosshair-point').remove();
    svg.selectAll('.average-crosshair-point').remove();
    svg.selectAll('.gaze-cursor-point').remove();

     //draw last n crosshair positions
     if(drawRawArray){
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

    const ellipse1 = ellipseSVG
    //draw raw gaze cursor
    if(drawRawCursor)
    {
      svg.selectAll('ellipse.red-fill')
        .data([ellipse1]) // Use your data here
        .join('ellipse')
        .attr('class', 'gaze-cursor-point red-fill')
        .attr('cx', d => d.centerX)
        .attr('cy', d => d.centerY)
        .attr('rx', d => d.ellipseWidth / 2)
        .attr('ry', d => d.ellipseHeight / 2)
        .attr('transform', d => `rotate(${d.angleInDeg}, ${d.centerX}, ${d.centerY})`)
        .style('fill', 'rgba(255, 0, 0, 0.1)')
        .style('stroke', 'none')
        .raise(); // Bring the red-filled ellipse to the front
    }

    if(DrawBlinkStatus)
    {
      svg.selectAll('rect.blink-status')
        .data([isBlinking])
        .join('rect')
        .attr('class', 'blink-status')
        .attr('x', 80)
        .attr('y', 20)
        .attr('width', 50)
        .attr('height', 50)
        .style('fill', d => d ? 'red' : 'green');
    }
    else {
      svg.selectAll('rect.blink-status').remove();
    }
  }, [dimensions, lastCrosshairPositions, averageCrosshairPosition, filteredLastCrosshairPositions, isBlinking]); // Dependencies for re-running the effect


  // Handle Generating the Face Mesh
  function onResults(results:any) {
    handleFaceMeshResults(
      results,
      webcamRef,
      canvasRef,
      savedMaxEyelidDistance,
      setSavedMaxEyelidDistance,
      setDistanceFromCam,
      setHeadPose,
      (leftIris, rightIris) => {
        setLeftIrisCoordinate(leftIris);
        setRightIrisCoordinate(rightIris);
      },
      (canvas, noseLandmark, yaw, pitch) => {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Draw orientation lines
          ctx.beginPath();
          const length = 100;
          ctx.moveTo(noseLandmark.x * canvas.width, noseLandmark.y * canvas.height);
          ctx.lineTo(
            noseLandmark.x * canvas.width - length * Math.sin(yaw),
            noseLandmark.y * canvas.height - length * Math.sin(pitch)
          );
          ctx.strokeStyle = "red";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
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
      const gazetraceprop = { //idk why this is needed but it is
        dimensions: dimensions,
        dpi: dpi,
        predictedCrosshairPositionRef: averageCrosshairPositionRef,
        showGazeTracing: showGazeTracing,
      }

      const { focalLengthRef, updateFocalLength } = useFocalLength();

      useEffect(() => {
        setGlobalFocalLengthRef(focalLengthRef); // Update the focal length
      }, [focalLength]);

      useEffect(() => {
        updateFocalLength(focalLength);
      }, [focalLength]);

  //key press handler, currently used to show detailed crosshair info
  useEffect(() => {
    // Function to handle key presses
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'a') {
        setDrawAverage(drawAverage => !drawAverage);
      } else if (event.key === 'p') {
        setDrawPredicted(drawPredicted => !drawPredicted);
      } else if (event.key === 'n') {
        setDrawRawArray(drawRawArray => !drawRawArray);
      } else if (event.key === 'm') {
        setDrawRawCursor(drawRawCursor => !drawRawCursor);
      } else if (event.key === 'b') {
        setDrawBlinkStatus(DrawBlinkStatus => !DrawBlinkStatus);
      } else if (event.key === 'h'){
        setShowUIControls((prev) => !prev);
      } else if (event.key === 'c'){
        performStaticCalibration(3, 3, 45, 45,
          clickCanvasRef,
          currentPointIndex,
          isPointDisplayed,
          setCalibrationPoints,
          setCurrentPointIndex,
          setIsPointDisplayed,
          leftIrisCoordinate,
          rightIrisCoordinate,
          headPose);
      } else if (event.key === 'r'){
        // Reset calibration
        setCalibrationPoints([]);
        setCurrentPointIndex(0);
      }
    };

    // Add event listener for keydown events
    window.addEventListener('keydown', handleKeyPress);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentPointIndex, isPointDisplayed, leftIrisCoordinate, rightIrisCoordinate, headPose]); // Empty dependency array ensures this effect runs only once

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
        onClick={(event) => 
          performManualCalibration(
            event,
            clickCanvasRef,
            setClickCoords,
            printIrisCoordinates,
            addCalibrationPointsToArray
          )
        }
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
          //onClick={handleCanvasClick}
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
      {/* Conditionally render all UI controls */}
      {showUIControls && (
        <div>
          <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 20 }}>
            <ScreenDPI setDPI={setDpi} />
            <CameraFOV setFocalLength={setFocalLength} />
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
          </div>
          <div>
            <p>Yaw (left-right): {headPose.yaw.toFixed(2)}°</p>
            <p>Pitch (up-down): {headPose.pitch.toFixed(2)}°</p>
            <p>Roll (tilt): {headPose.roll.toFixed(2)}°</p>
            <p>Focal Length : {focalLength.toFixed(2)} px</p>
          </div>
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 20, backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', padding: '10px', borderRadius: '5px' }}>
          <h4>Hotkeys</h4>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            <li>"H" - Hide UI</li>
            <li>-----------------------------------------------------</li>
            <li>"C" - Cycle through static calibration</li>
            <li>"R" - Reset Calibration</li>
            <li>"LMB" - Create manual calibration point</li>
            <li>----------------------------------------------------</li>
            <li>"A" - Toggle Average Crosshair</li>
            <li>"P" - Toggle Predicted Crosshair</li>
            <li>"N" - Toggle Previous Points</li>
            <li>"M" - Toggle Gaze Cursor</li>
            <li>"B" - Toggle Blink Status</li>
            <li>----------------------------------------------------</li>
          </ul>
        </div>
        </div>
      )}

      {/* Other UI Components */}
      <div>
        {showBoxContainer && <BoxContainer crosshairPosition={averageCrosshairPosition} />}
      </div>
      <div>
        {showErrorTest && <ErrorSequenceTest dimensions={dimensions} dpi={dpi} predictedCrosshairPosition={averageCrosshairPosition} />}
      </div>
      <div>
        {showStabilityTest && <StabilityTest dimensions={dimensions} dpi={dpi} predictedCrosshairPositionRef={averageCrosshairPositionRef} showStabilityTest={showStabilityTest} />}
      </div>
      <div>
        {showGazeTracing && <GazeTracing {...gazetraceprop} />}
      </div>
      <div>
        {showMemoryGame && <MemoryGame crosshairPosition={averageCrosshairPosition} rowSize={rowSize} colSize={colSize} DPI={dpi} />}
      </div>
  </div>

    </div>
  );
}; 


export default Home;
