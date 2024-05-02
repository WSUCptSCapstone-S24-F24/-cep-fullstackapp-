// stability_test.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { calculateErrorBounds, pixelsToInches, getAngleOfError } from '../utils/MathUtils';
import { StabilityTestProps } from '../types/interfaces';

const StabilityTest: React.FC<StabilityTestProps> = ({ dimensions, dpi, predictedCrosshairPositionRef, showStabilityTest }) => {
    const stabilityCanvasRef = useRef<HTMLCanvasElement>(null);
    const vectorSvgRef = useRef<SVGSVGElement>(null); // Ref for the SVG
    const [stabilityCrosshairPositions, setStabilityCrosshairPositions] = useState<{x: number, y: number}[]>([]);
    const [stabilityComplete, setStabilityComplete] = useState(false);

    // Center dot
    useEffect(() => {
        const canvas = stabilityCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (showStabilityTest) {
            const centerX = dimensions.width / 2;
            const centerY = dimensions.height / 2;
            const radius = 10;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'orange';
            ctx.fill();

            const text = "Focus on center orange dot and press R to begin stability sequence.";
            ctx.font = '16px Arial';
            ctx.fillText(text, centerX - ctx.measureText(text).width / 2, centerY + radius + 20);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [showStabilityTest, dimensions]);

    // Record crosshair positions
    useEffect(() => {
        let frameRequestId: number | null = null;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code === "KeyR" && showStabilityTest) {
                console.log("Stability sequence started...");
                event.preventDefault();
                const startTime = performance.now();
                
                const capturePositions = (timestamp: number) => {
                    const elapsedTime = timestamp - startTime;
                    
                    if (elapsedTime <= 3000) {
                        if (!predictedCrosshairPositionRef.current) return;
                        const predictedPosition = {x: predictedCrosshairPositionRef.current.x, y: predictedCrosshairPositionRef.current.y}

                        setStabilityCrosshairPositions(prevPositions => [...prevPositions, predictedPosition]);
                        frameRequestId = requestAnimationFrame(capturePositions);
                    } else {
                        setStabilityComplete(true);
                        console.log("Stability sequence ended...");
                        cancelAnimationFrame(frameRequestId!);
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
    }, [showStabilityTest, dimensions, predictedCrosshairPositionRef]);

    // Vector field
    useEffect(() => {
        if (stabilityComplete) {
            const svg = d3.select(vectorSvgRef.current)
            svg.selectAll('*').remove();

            const centerX = dimensions.width / 2;
            const centerY = dimensions.height / 2;

            const vectors = stabilityCrosshairPositions.map(pos => ({
                dx: pos.x - centerX,
                dy: pos.y - centerY
            }));
            console.log(vectors.length)

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

            // Draw vectors
            svg.selectAll(".vector")
                .data(vectors)
                .enter()
                .append("line")
                .attr("x1", centerX)
                .attr("y1", centerY)
                .attr("x2", d => centerX + d.dx)
                .attr("y2", d => centerY + d.dy)
                .attr("stroke", "red")
                .attr("stroke-width", 1)
                .attr("marker-end", "url(#arrow)");

            setStabilityComplete(false);  // Reset for potential next test
        }
    }, [stabilityComplete, stabilityCrosshairPositions, dimensions]);

    // Bounding box
    useEffect(() => {
        if (stabilityComplete){

            const centerDotX = dimensions.width / 2;
            const centerDotY = dimensions.height / 2;

            const vectors = stabilityCrosshairPositions.map(pos => ({
                dx: pos.x - centerDotX,
                dy: pos.y - centerDotY
            }));

            const bounds = calculateErrorBounds(vectors);

            const canvas = stabilityCanvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (ctx){
                const left = centerDotX + bounds.left;
                const right = centerDotX + bounds.right;
                const up = centerDotY + bounds.up;
                const down = centerDotY + bounds.down;

                const width = right - left;
                const height = down - up;

                ctx.rect(left, up, width, height);
                ctx.strokeStyle = 'blue';
                ctx.stroke();

                ctx.fillStyle ='orange';
                ctx.font = '16px Arial'

                let textX = right + 10;
                let textY = up;

                ctx.fillText(`Left: ${pixelsToInches(Math.abs(bounds.left), dpi).toFixed(2)}in`, textX, textY += 20);
                ctx.fillText(`Right: ${pixelsToInches(Math.abs(bounds.right), dpi).toFixed(2)}in`, textX, textY += 20);
                ctx.fillText(`Up: ${pixelsToInches(Math.abs(bounds.up), dpi).toFixed(2)}in`, textX, textY += 20);
                ctx.fillText(`Down: ${pixelsToInches(Math.abs(bounds.down), dpi).toFixed(2)}in`, textX, textY += 20);
                ctx.fillText(`Angle of Error: ${getAngleOfError(pixelsToInches(Math.abs(width), dpi), 65).toFixed(2)}°`, textX, textY += 20);
            }
        }
    }, [stabilityComplete, stabilityCrosshairPositions, dimensions.width, dimensions.height]);

    return (
        <>
            <canvas ref={stabilityCanvasRef} width={dimensions.width} height={dimensions.height} style={{ position: 'absolute', left: 0, top: 0, zIndex: 12 }}/>
            <svg ref={vectorSvgRef} width={dimensions.width} height={dimensions.height} style={{ position: 'absolute', left: 0, top: 0, zIndex: 12 }} />
        </>
    );
};

export default StabilityTest;