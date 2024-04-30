// DrawUtils.tsx
import { pixelsToInches } from "./MathUtils";
import * as d3 from "d3";



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

// Draws the green crosshair on our screen which will act as our predicted point via eye tracking
export function drawCrosshair(canvas : HTMLCanvasElement, x: number, y:number ) {
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

// Creates a little red dot at cursor click location
export const drawOnClick = (x: number, y:number, clickCanvasRef : any) => {
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

// Draws vector field of vector data array
export const drawVectorField = (vectors : VectorData[], vectorCalibRef: any, dpi : number) => {
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
        .attr("x2", d => d.dotPosition.x)
        .attr("y2", d => d.dotPosition.y)
        .attr("x1", d => d.dotPosition.x + d.dx)
        .attr("y1", d => d.dotPosition.y + d.dy)
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
        .text((d, i) => `${pixelsToInches(magnitudes[i], dpi).toFixed(2)}in`)
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

// This function will crop our webcam and create a zoomed in video at inputted point
export function drawZoomedEye(canvas:HTMLCanvasElement, video: HTMLVideoElement, pointX:number, pointY:number, zoom:number){
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
};