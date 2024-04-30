// MathUtils.tsx

// This function will get the line of best fit between all of our points
// Returns the slope and intercept of the line of best fit
export const linearRegression = (irisCoords: number[], screenCoords: number[]) => {
    const n = irisCoords.length;
    const sumX = irisCoords.reduce((a,b) => a + b, 0);
    const sumY = screenCoords.reduce((a,b) => a + b, 0);
    const sumXx = irisCoords.reduce((a,b) => a + b * b, 0);
    const sumXy = irisCoords.reduce((a,b,i) => a + b * screenCoords[i], 0);

    const slope = (n * sumXy - sumX * sumY) / (n * sumXx - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return {slope, intercept};
};

// Converts number of pixels to inches
export function pixelsToInches(pixels : number, dpi: number) {
    return (pixels / dpi);
}
  
// Gets the angle of error
export function getAngleOfError(targetSize: number /*in inches*/, distance: number /*in cm*/)
{
    targetSize *= 2.54; //converting to cm
    return (180 / Math.PI) * (2 * Math.atan(0.5 * (targetSize / distance)));
};

// Takes array of vectors and return the max vector length in all four directions
export const calculateErrorBounds = (vectors : {dx :number, dy: number}[]) => {
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
};