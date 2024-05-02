// error_sequence_test.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { pixelsToInches } from '../utils/MathUtils';
import { DotData, VectorData, ErrorSequenceProps } from '../types/interfaces';

const ErrorSequenceTest: React.FC<ErrorSequenceProps> = ({ dimensions, dpi, predictedCrosshairPosition }) => {
    const svgRef = useRef(null);
    const [data, setData] = useState<DotData[]>([]);
    const [currentDotIndex, setCurrentDotIndex] = useState<number | null>(0);
    const [userInputs, setUserInputs] = useState<VectorData[]>([]);

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
    }, [dimensions]); 

    // Draw all of our dots and the letter inside each dot
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.attr("width", dimensions.width)
            .attr("height", dimensions.height);

        svg.selectAll("*").remove();  // Clear previous contents

        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 10)
            .style("fill", (d, i) => i === currentDotIndex ? "blue" : "none")
            .style("opacity", 1);

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
    }, [data, currentDotIndex, dimensions]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (currentDotIndex !== null && predictedCrosshairPosition){
                const keyMap: { [key: string]: string } = { ArrowUp: 'U', ArrowDown: 'D', ArrowLeft: 'L', ArrowRight: 'R' };
                const direction = keyMap[event.key];
                event.preventDefault(); // Prevents the screen scrolling when pressing arrow keys
    
                if (direction && direction === data[currentDotIndex!].direction) {
                    // Process the correct input
                    const newUserInput = {
                        dotIndex: currentDotIndex!,
                        direction: data[currentDotIndex!].direction,
                        dotPosition: {x: data[currentDotIndex!].x, y: data[currentDotIndex!].y},
                        crosshairPosition: predictedCrosshairPosition,
                        userDirection: direction,
                        dx: predictedCrosshairPosition.x - data[currentDotIndex!].x,
                        dy: predictedCrosshairPosition.y - data[currentDotIndex!].y,
                    };
                    
                    if (currentDotIndex! + 1 < data.length){ // Move to next dot, unless we are at the end of the dot list
                        setUserInputs(userInputs => [...userInputs, newUserInput]);
                        setCurrentDotIndex(currentDotIndex! + 1);
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
    }, [currentDotIndex, data, dimensions.width, dimensions.height, userInputs, predictedCrosshairPosition]);

    const drawVectorField = (vectors : VectorData[]) => {
        const svg = d3.select(svgRef.current); 
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

    return (
        <svg ref={svgRef} style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 12 
    }}></svg>
    );
}

export default ErrorSequenceTest; 