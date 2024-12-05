//gaze_tracing.tsx
//basically a direct copy of the stability test but it draws the vectors differently
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { calculateErrorBounds, pixelsToInches, getAngleOfError } from '../utils/MathUtils';
import { GazeTracingProps } from '../types/interfaces';
import gazeTraceImage from '../yarbus2.png';

const GazeTracing: React.FC<GazeTracingProps> = ({ dimensions, dpi, predictedCrosshairPositionRef, showGazeTracing }) => {
  const stabilityCanvasRef = useRef<HTMLCanvasElement>(null);
  const vectorSvgRef = useRef<SVGSVGElement>(null); // Ref for the SVG
  const [stabilityCrosshairPositions, setStabilityCrosshairPositions] = useState<{ x: number, y: number }[]>([]);
  const [stabilityComplete, setStabilityComplete] = useState(false);
  const [averageCrosshairPosition, setAverageCrosshairPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); //average crosshair position over the duration of the test
  const svgRef = useRef(null);

  // Center dot
  useEffect(() => {
    const canvas = stabilityCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (showGazeTracing) {
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height - dimensions.height/7;
      const radius = 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'orange';
      ctx.fill();

      const text = "Press F to begin gaze tracing.";
      ctx.font = '16px Arial';
      ctx.fillText(text, centerX - ctx.measureText(text).width / 2, centerY + radius + 100);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [showGazeTracing, dimensions]);

  // Record crosshair positions
  useEffect(() => {
    let frameRequestId: number | null = null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyF" && showGazeTracing) {
        console.log("Stability sequence started...");
        event.preventDefault();
        const startTime = performance.now();
        let stabilityPositions: { x: number, y: number }[] = [] //for average

        const capturePositions = (timestamp: number) => {
          const elapsedTime = timestamp - startTime;

          if (elapsedTime <= 10000) { //config
            if (!predictedCrosshairPositionRef.current) return;
            const predictedPosition = { x: predictedCrosshairPositionRef.current.x, y: predictedCrosshairPositionRef.current.y }

            setStabilityCrosshairPositions(prevPositions => [...prevPositions, predictedPosition]);
            stabilityPositions.push(predictedPosition); //for average
            console.log(predictedPosition)
            frameRequestId = requestAnimationFrame(capturePositions);
          } else {
            //find average
            const totalPositions = stabilityPositions.length;
            if (totalPositions > 0) {
              const avgPosition = stabilityPositions.reduce(
                (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }),
                { x: 0, y: 0 }
              );
              const avgX = avgPosition.x / totalPositions;
              const avgY = avgPosition.y / totalPositions;

              setAverageCrosshairPosition({ x: avgX, y: avgY });

              console.log("test putting math in variable: ", avgX, avgY);

              setStabilityComplete(true);
              console.log("Stability sequence ended...");
              cancelAnimationFrame(frameRequestId!);
            }
          }
        };

        frameRequestId = requestAnimationFrame(capturePositions);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (frameRequestId) cancelAnimationFrame(frameRequestId);
    };
  }, [showGazeTracing, dimensions, predictedCrosshairPositionRef]);

  // vector field
  useEffect(() => {
    if (stabilityComplete) {
      const svg = d3.select(vectorSvgRef.current);
      svg.selectAll('*').remove();

      const vectors = stabilityCrosshairPositions.map(pos => ({
        x: pos.x,
        y: pos.y
      }));

      console.log(vectors.length);

      // draw arrows
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

      // initialize start position
      let previousPosition = vectors[0]; // start at the first vector, so we dont draw a line from the center dot

      // draw vectors
      vectors.slice(1).forEach((vector) => {
        svg.append("line")
          .attr("x1", previousPosition.x)
          .attr("y1", previousPosition.y)
          .attr("x2", vector.x)
          .attr("y2", vector.y)
          .attr("stroke", "red")
          .attr("stroke-width", 1)
          .attr("marker-end", "url(#arrow)");

        // update the previous position to the current one for the next vector
        previousPosition = { x: vector.x, y: vector.y };
      });

      setStabilityComplete(false);  // reset for potential next test
    }
  }, [stabilityComplete, stabilityCrosshairPositions, dimensions]);

  return (
    <>
      {/* PNG */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 11, // PNG behind the SVG
      }}>
        <img
          src={gazeTraceImage}
          alt="gazeTraceImage"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* SVG element */}
      <svg ref={svgRef} style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 15 // SVG above the PNG
      }}></svg>
      <canvas ref={stabilityCanvasRef} width={dimensions.width} height={dimensions.height} style={{ position: 'absolute', left: 0, top: 0, zIndex: 12 }} />
      <svg ref={vectorSvgRef} width={dimensions.width} height={dimensions.height} style={{ position: 'absolute', left: 0, top: 0, zIndex: 12 }} />
    </>
  );
};

export default GazeTracing;