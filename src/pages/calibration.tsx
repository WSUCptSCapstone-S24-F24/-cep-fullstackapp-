import { FaceMesh } from '@mediapipe/face_mesh'
import * as Facemesh from '@mediapipe/face_mesh'
import * as cam from '@mediapipe/camera_utils'
import Webcam from 'react-webcam'
import {useRef, useEffect, useState, useContext} from 'react'
import React from 'react'
import BoxContainer from '../box_container'
import {OneEuroFilter} from '1eurofilter'
import * as d3 from "d3";


declare global {
  interface Window {
    drawConnectors:any;
  }
}

function Calibration() {
  
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
    const [showStabilityCenterDot, setShowStabilityCenterDot] = useState<boolean>(false);
    const [stabilityCrosshairPositions, setStabilityCrosshairPositions] = useState<{x: number; y: number}[]>([]);
    const [stabilityComplete, setStabilityComplete] = useState<boolean>(false);

    // Package of points that take up one slot in our calibrationPoints array
    interface CalibrationPoint{
      irisX: number,
      irisY: number,
      screenX: number,
      screenY: number;
    }

    interface DotData {
      x: number;
      y: number;
      dx: number;
      dy: number;
      direction: 'U' | 'D' | 'L' | 'R';
    }

    interface VectorData {
      dotIndex: number;
      direction: string;
      dotPosition: {x: number, y: number};
      crosshairPosition: {x: number, y: number};
      userDirection: string;
      dx: number;
      dy: number;
      magnitude?: number;
    }

    const [data, setData] = useState<DotData[]>([]);

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


    const [currentDotIndex, setCurrentDotIndex] = useState<number | null>(0);
    const [userInputs, setUserInputs] = useState<{
      dotIndex: number,
      direction: string,
      dotPosition:{x: number, y: number},
      crosshairPosition: {x: number, y:number},
      userDirection: string}[]>([]);

    // Generate Error Sequence Dots and Data
    useEffect(() => {
      // Create initial data set
      const generateData = (): DotData[] => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const padding = 50;

        // Calculate intervals for 4x4 grid
        const cols = 4;
        const rows = 4;
        const intervalX = (width - 2 * padding) / (cols - 1);
        const intervalY = (height - 2 * padding) / (rows - 1);

        const newData: DotData[] = [];

        // Generate dots evenly spaced in the screen with a random direction
        for (let i = 0; i < cols; i++){
          for (let j = 0; j < rows; j++){
            const directions: Array<'U' | 'D' | 'L' | 'R'> = ['U', 'D', 'L', 'R'];
            const direction = directions[Math.floor(Math.random() * directions.length)];
              newData.push({
                  x: i * intervalX + padding,
                  y: j * intervalY + padding,
                  dx: Math.random() * 20 - 10,
                  dy: Math.random() * 20 - 10,
                  direction,
              });
          }
        }
        return newData;
      };

      // Set our global data to initial data we generate
      setData(generateData());
    }, []); 

    // Draw all of our dots and the letter inside each dot
    useEffect(() => {
      if (vectorCalibRef.current && data.length > 0){
        const width = window.innerWidth;
        const height = window.innerHeight;
        const svg = d3.select(vectorCalibRef.current)
                      .attr("width", width)
                      .attr("height", height);
        svg.selectAll("*").remove();
          
        svg.selectAll(".dot")
          .data(data)
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", 10)
          .style("fill", (d, i) => i === currentDotIndex ? "blue" : "none") // Dot will change to red if we are selected on this dot. (currentIndex)
          .style("opacity", (d, i) => i === currentDotIndex ? 1 : 0);

        svg.selectAll(".text")
          .data(data)
          .enter()
          .append("text")
          .attr("x", d => d.x)
          .attr("y", d => d.y + 5)
          .attr("text-anchor", "middle")
          .text(d => d.direction)
          .style("fill", "white")
          .attr("font-size", "12px")
          .style("opacity", (d, i) => i === currentDotIndex ? 1 : 0);
      }
    }, [data, currentDotIndex]);

    useEffect(() => {
      // Handles key press
      const handleKeyPress = (event: KeyboardEvent) => {
        const directionKeys = { ArrowUp: 'U', ArrowDown: 'D', ArrowLeft: 'L', ArrowRight: 'R' };
        const userDirection = directionKeys[event.key as keyof typeof directionKeys];
        if (userDirection && currentDotIndex !== null){
          event.preventDefault(); // Prevents arrow keys from moving the screen when pressed (scroll)

          const currentDot = data[currentDotIndex];
          
          if (userDirection === currentDot.direction){  // Only move onto the next dot if we select the correct input
            const newUserInput = {
              dotIndex: currentDotIndex,
              direction: currentDot.direction,
              dotPosition: {x: currentDot.x, y: currentDot.y},
              crosshairPosition: predictedCrosshairPosition,
              userDirection: userDirection,
            };
  
            if (currentDotIndex + 1 < data.length){ // Move to next dot, unless we are at the end of the dot list
              setUserInputs(userInputs => [...userInputs, newUserInput]);
              setCurrentDotIndex(currentDotIndex + 1);
            }
            else{
              setUserInputs(userInputs => [...userInputs, newUserInput]);

              const allUserInputs = [...userInputs, newUserInput];           // Ensures we get all of the data. Earlier solutions were leaving out last data point

              const vectors : VectorData[] = allUserInputs.map(input => {       // Takes the difference of each dot position vs crosshair position
                const dx = input.crosshairPosition.x - input.dotPosition.x;  // Saves it to a vector array
                const dy = input.crosshairPosition.y - input.dotPosition.y;

                return { ...input, dx, dy};
              });
       
              drawVectorField(vectors); 
            }
          }
        } 
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentDotIndex, data, userInputs, predictedCrosshairPosition]);

    const drawVectorField = (vectors : VectorData[]) => {
      const svg = d3.select(vectorCalibRef.current); 
      svg.selectAll("*").remove(); // Clear previous SVG contents
      
      const maxVectorLength = 50;
  
      const magnitudes = vectors.map(vector => {       // Gets the magnitude of each vector
          return Math.sqrt(vector.dx ** 2 + vector.dy ** 2);
      });
      const maxMagnitude = Math.max(...magnitudes);
      const minMagnitude = Math.min(...magnitudes);
      const sumOfMagnitudes = magnitudes.reduce((acc, val) => acc + val, 0); // Calculate sum of magnitudes
      const averageMagnitude = sumOfMagnitudes / magnitudes.length; // Calculate average magnitude
      
      // Calculate mean absolute error
      const absoluteErrors = magnitudes.map(magnitude => Math.abs(magnitude - averageMagnitude));
      const meanAbsoluteError = absoluteErrors.reduce((acc, val) => acc + val, 0) / magnitudes.length;

      // Calculate root mean square error
      const squaredErrors = magnitudes.map(magnitude => (magnitude - averageMagnitude) ** 2);
      const meanSquaredError = squaredErrors.reduce((acc, val) => acc + val, 0) / magnitudes.length;
      const rootMeanSquaredError = Math.sqrt(meanSquaredError);

  
      // Draws the vector field
      svg.append("defs").selectAll("marker")
          .data(["arrow"])
          .enter().append("marker")
          .attr("id", d => d)
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 6)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("fill", "red")
          .attr("d", "M0,-5L10,0L0,5");
  
      // Draw vectors as lines
      svg.selectAll(".vector")
          .data(vectors)
          .enter().append("line")
          .attr("class", "vector")
          .attr("x1", d => d.dotPosition.x)
          .attr("y1", d => d.dotPosition.y)
          .attr("x2", d => d.dotPosition.x + d.dx)
          .attr("y2", d => d.dotPosition.y + d.dy)
          .attr("stroke", "red")
          .attr("stroke-width", 1.5)
          .attr("marker-end", "url(#arrow)"); // Use the arrow marker defined above
  
      // Draws the magnitudes
      svg.selectAll(".vector-text")
          .data(vectors)
          .enter().append("text")
          .attr("class", "vector-text")
          .attr("x", d => d.dotPosition.x + (d.dx / maxMagnitude) * maxVectorLength)
          .attr("y", d => d.dotPosition.y + (d.dy / maxMagnitude) * maxVectorLength)
          .attr("dx", 5)
          .attr("dy", 5)
          .text((d, i) => magnitudes[i].toFixed(2))
          .attr("font-size", "10px")
          .attr("fill", "black");
  
      // Display sum of magnitudes
      svg.append("text")
          .attr("x", 10)
          .attr("y", 20)
          .text("Sum of Magnitudes: " + sumOfMagnitudes.toFixed(2))
          .attr("font-size", "12px")
          .attr("fill", "black");
  
      // Display max magnitude
      svg.append("text")
          .attr("x", 10)
          .attr("y", 40)
          .text("Max Magnitude: " + maxMagnitude.toFixed(2))
          .attr("font-size", "12px")
          .attr("fill", "black");

      // Display min magnitude
      svg.append("text")
          .attr("x", 10)
          .attr("y", 60)
          .text("Min Magnitude: " + minMagnitude.toFixed(2))
          .attr("font-size", "12px")
          .attr("fill", "black");
  
      // Display average magnitude
      svg.append("text")
          .attr("x", 10)
          .attr("y", 80)
          .text("Average Magnitude: " + averageMagnitude.toFixed(2))
          .attr("font-size", "12px")
          .attr("fill", "black");

      // Display mean absolute error
      svg.append("text")
      .attr("x", 10)
      .attr("y", 100)
      .text("Mean Absolute Error: " + meanAbsoluteError.toFixed(2))
      .attr("font-size", "12px")
      .attr("fill", "black");

       // Display root mean square error
      svg.append("text")
      .attr("x", 10)
      .attr("y", 120)
      .text("Root Mean Square Error: " + rootMeanSquaredError.toFixed(2))
      .attr("font-size", "12px")
      .attr("fill", "black");
  };
  

    // STABILITY TEST
    useEffect(() => {
      if (showStabilityCenterDot) {
        const canvas = document.getElementById('stabilityCanvas') as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {   // Create center dot for stability test
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const radius = 10; 
    
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'orange'; 
            ctx.fill();

            // Instruction text underneath dot
            ctx.font = '16px Ariel';
            ctx.fillStyle = 'orange';

            const text = "Focus on center orange dot and press R to being stability sequence.";
            const textWidth = ctx.measureText(text).width;
            const textX = centerX - textWidth / 2;
            const textY = centerY + radius + 20;

            ctx.fillText(text, textX, textY);
          }
        }
      } else {
        // Clear dot when clicking button again.
        const canvas = document.getElementById('stabilityCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, [showStabilityCenterDot]);

    // This reference is solely to make sure our predicted crosshair location is being updated in realtime
    // Usually that is the case, but it does not update normally during our stability sequence. The capturePositions function
    const predictedCrosshairPositionRef = useRef(predictedCrosshairPosition);

    useEffect(() => {
      predictedCrosshairPositionRef.current = predictedCrosshairPosition;
    }, [predictedCrosshairPosition]); // Update the ref whenever the position changes

    // Captures crosshair positions during stability sequence
    useEffect(() => {
      let frameRequestId: number | null = null;
      const startTime = performance.now();

      let isCapturing = false;  // capture crosshair positions for data
      const capturePositions = (timestamp: number) => {
        if (!isCapturing) return;

        const elapsedTime = timestamp - startTime;
        
        if (elapsedTime <= 3000){   // How long we will capture data for. 3000 = 3 seconds
            const predictedPosition = {x: predictedCrosshairPositionRef.current.x, y: predictedCrosshairPositionRef.current.y};
            
            setStabilityCrosshairPositions(prevPositions => [...prevPositions, predictedPosition]);  // Add crosshair position to the data array

            frameRequestId = requestAnimationFrame(capturePositions);
        } else{
          isCapturing = false;
          setStabilityComplete(true);
        }
      };

      // When R is pressed on the keyboard, we will begin stabililty sequence above
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === "KeyR" && showStabilityCenterDot) {
          console.log("Starting stability sequence...");
          setStabilityCrosshairPositions([]);
          setStabilityComplete(false);
          isCapturing = true;
          frameRequestId = requestAnimationFrame(capturePositions);
        }
      };
    
      window.addEventListener("keydown", handleKeyDown);
    
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        if (frameRequestId !== null){
          cancelAnimationFrame(frameRequestId);
        }
      };
    }, [showStabilityCenterDot, predictedCrosshairPosition]); // This effect depends on center dot, so it updates if center dot changes

    // When stabililty is complete, we will create vector field and map our error bounds 
    useEffect(() => {
      if (stabilityComplete){

        const centerDotX = window.innerWidth / 2;
        const centerDotY = window.innerHeight / 2;

        const vectors = stabilityCrosshairPositions.map(pos=> ({  // map all of our vectors
          dx: pos.x - centerDotX,
          dy: pos.y - centerDotY
        }));

        // Calculate the bounds using the vectors
        const bounds = calculateErrorBounds(vectors);

        const canvas = document.getElementById('stabilityCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
            // Draw our bounds rectangle over our vector field
            const left = centerDotX + bounds.left;
            const right = centerDotX + bounds.right;
            const up = centerDotY + bounds.up;
            const down = centerDotY + bounds.down;

            const width = right - left;
            const height = down - up;

            ctx.rect(left, up, width, height);
            ctx.strokeStyle = 'blue';
            ctx.stroke();

            //Text which display our error bounds
            ctx.fillStyle = 'orange';
            ctx.font = '16px Arial';

            let textX = right + 10;
            let textY = up;

            ctx.fillText(`Left: ${bounds.left.toFixed(2)}px`, textX, textY += 20);
            ctx.fillText(`Right: ${bounds.right.toFixed(2)}px`, textX, textY += 20);
            ctx.fillText(`Up: ${bounds.up.toFixed(2)}px`, textX, textY += 20);
            ctx.fillText(`Down: ${bounds.down.toFixed(2)}px`, textX, textY += 20);
        }

        console.log("Stability is complete. Vectors calculated: ", vectors);
        setStabilityComplete(false);  // Reset

        // Draws the vector field here
        const svg = d3.select(stabilityVectorRef.current);
        svg.selectAll("*").remove();
    
        svg.append("defs").selectAll("marker")
          .data(["arrow"])
          .enter().append("marker")
          .attr("id", d => d)
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 6)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("fill", "red")
          .attr("d", "M0,-5L10,0L0,5");

        svg.selectAll(".vector")
        .data(vectors)
        .enter().append("line")
        .attr("class", "vector")
        .attr("x1", d => centerDotX)
        .attr("y1", d => centerDotY)
        .attr("x2", d => centerDotX + d.dx)
        .attr("y2", d => centerDotY + d.dy)
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("marker-end", "url(#arrow)");
        
      }
    }, [stabilityComplete, stabilityCrosshairPositions]);

    // Takes array of vectors and return the max vector length in all four directions
    const calculateErrorBounds = (vectors : {dx :number, dy: number}[]) => {
      let bounds = {
        left: Number.MAX_VALUE, // Maximum negative dx
        right: Number.MIN_VALUE, // Maximum positive dx
        up: Number.MAX_VALUE, // Maximum negative dy
        down: Number.MIN_VALUE, // Maximum positive dy
      };

      vectors.forEach(vector => {
        if (vector.dx < bounds.left) bounds.left = vector.dx;
        if (vector.dx > bounds.right) bounds.right = vector.dx;
        if (vector.dy < bounds.up) bounds.up = vector.dy;
        if (vector.dy > bounds.down) bounds.down = vector.dy; 
      });

      return bounds;
    }

    // This function will get the line of best fit between all of our points
    // Returns the slope and intercept of the line of best fit
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

      // Get current timestamp
      const timestamp = performance.now() / 1000;

      // Create OneEuroFilter instances for left and right iris coordinates (Assume the framerate is 30Hz)
      const leftIrisFilterX = new OneEuroFilter(30, 1.0, 0.0, 1.0);
      const leftIrisFilterY = new OneEuroFilter(30, 1.0, 0.0, 1.0);
      const rightIrisFilterX = new OneEuroFilter(30, 1.0, 0.0, 1.0);
      const rightIrisFilterY = new OneEuroFilter(30, 1.0, 0.0, 1.0);

      // Apply OneEuroFilter to filter left and right iris coordinates
      const filteredLeftX = leftIrisFilterX.filter(leftIrisCoord.x, timestamp);
      const filteredLeftY = leftIrisFilterY.filter(leftIrisCoord.y, timestamp);
      const filteredRightX = rightIrisFilterX.filter(rightIrisCoord.x, timestamp);
      const filteredRightY = rightIrisFilterY.filter(rightIrisCoord.y, timestamp);


      setLeftIrisCoordinate({

        x: leftIrisCoord.x,
        y: leftIrisCoord.y

        // x: filteredLeftX,
        // y: filteredLeftY
      });

      setRightIrisCoordinate({
        x: rightIrisCoord.x,
        y: rightIrisCoord.y
        
        // x: filteredRightX,
        // y: filteredRightY
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

          /*ctx.beginPath();
          ctx.arc(x,y,5,0,2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill(); Currently hiding the red dots on click*/
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
          zIndex: 11, 
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
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 20 }}>
        <button onClick={() => setShowBoxContainer(!showBoxContainer)}>
          {showBoxContainer ? "Disable Target Practice" : "Enable Target Practice"}
        </button>
        <button onClick={() => setShowStabilityCenterDot(!showStabilityCenterDot)}>
          {showStabilityCenterDot ? "Hide Stability Test" : "Show Stability Test"}
        </button>
      </div>
      <div>
        {showBoxContainer && <BoxContainer crosshairPosition={predictedCrosshairPosition}/>}
      </div>      
      <canvas id="stabilityCanvas" width="1920" height="1080" style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 10,
      }}>
      </canvas>
    </div>
    
  );
}

export default Calibration;
