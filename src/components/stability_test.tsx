// stability_test.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { calculateErrorBounds, pixelsToInches, getAngleOfError } from '../utils/MathUtils';  // Adjust import paths as needed

interface StabilityTestProps {
    dimensions: { width: number, height: number };
    dpi: number;
    predictedCrosshairPosition: {x: number, y: number};
    showStabilityTest: boolean;
}

const StabilityTest: React.FC<StabilityTestProps> = ({ dimensions, dpi, predictedCrosshairPosition, showStabilityTest }) => {
    const stabilityCanvasRef = useRef<HTMLCanvasElement>(null);
    const [stabilityCrosshairPositions, setStabilityCrosshairPositions] = useState<{x: number, y: number}[]>([]);
    const [stabilityComplete, setStabilityComplete] = useState(false);

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
                        const centerX = dimensions.width / 2;
                        const centerY = dimensions.height / 2;
                        setStabilityCrosshairPositions(prevPositions => [...prevPositions, { x: predictedCrosshairPosition.x, y: predictedCrosshairPosition.y }]);
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
    }, [showStabilityTest, dimensions, predictedCrosshairPosition]);

    useEffect(() => {
        if (stabilityComplete) {
            const svg = d3.select(stabilityCanvasRef.current);
            svg.selectAll('*').remove();  // Clear previous SVG contents

            const centerX = dimensions.width / 2;
            const centerY = dimensions.height / 2;

            const vectors = stabilityCrosshairPositions.map(pos => ({
                dx: pos.x - centerX,
                dy: pos.y - centerY
            }));

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
                .attr("stroke-width", 1.5)
                .attr("marker-end", "url(#arrow)");

            setStabilityComplete(false);  // Reset for potential next test
        }
    }, [stabilityComplete, stabilityCrosshairPositions, dimensions]);

    return (
        <canvas ref={stabilityCanvasRef} width={dimensions.width} height={dimensions.height} style={{ position: 'absolute', left: 0, top: 0, zIndex: 20 }}></canvas>
    );
};

export default StabilityTest;