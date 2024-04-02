import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function Home() {
    const ref = useRef(null);

    useEffect(() => {
        // set SVG
        const width = window.innerWidth;
        const height = window.innerHeight;
        const svg = d3.select(ref.current)
                      .attr("width", width)
                      .attr("height", height);
        
        
        // Calculate intervals for 4x4 grid
        const cols = 4;
        const rows = 4;
        const intervalX = width / (cols - 1);
        const intervalY = height / (rows - 1);

        // Generate random vectors
        const data = [];
        for (let i = 0; i < cols; i++){
            for (let j = 0; j < rows; j++){
                data.push({
                    x: i * intervalX,
                    y: j * intervalY,
                    dx: Math.random() * 20 - 10,
                    dy: Math.random() * 20 - 10,
                });
            }
        }

        // Draw vector field
        svg.selectAll(".vector")
           .data(data)
           .enter()
           .append("line") // Draw line
           .attr("x1", d => d.x)
           .attr("y1", d => d.y)
           .attr("x2", d => d.x + d.dx)
           .attr("y2", d => d.y + d.dy)
           .attr("stroke", "black")
           .attr("marker-end", "url(#arrow)"); // Add arrow
        // Def of arrow
        svg.append("defs")
           .append("marker")
           .attr("id", "arrow")
           .attr("viewBox", "0 -5 10 10")
           .attr("refX", 5)
           .attr("refY", 0)
           .attr("markerWidth", 6)
           .attr("markerHeight", 6)
           .attr("orient", "auto")
           .append("path")
           .attr("d", "M0,-5L10,0L0,5")
           .attr("fill", "black");
    }, []);

    return (
        <div>
            <h1>Hello World!</h1>
            <svg ref={ref}></svg>
        </div>
    );
}

export default Home;