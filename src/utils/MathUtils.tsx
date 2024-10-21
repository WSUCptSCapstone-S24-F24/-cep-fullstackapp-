// MathUtils.tsx

// This function will get the line of best fit between all of our points
// Returns the slope and intercept of the line of best fit
export const linearRegression = (
  irisCoords: number[], 
  screenCoords: number[], 
  yaw: number[], 
  pitch: number[]
) => {
  const n = irisCoords.length;

  // Sum of each variable
  const sumX = irisCoords.reduce((a, b) => a + b, 0);
  const sumYaw = yaw.reduce((a, b) => a + b, 0);
  const sumPitch = pitch.reduce((a, b) => a + b, 0);
  const sumY = screenCoords.reduce((a, b) => a + b, 0);

  // Sum of products of each variable
  const sumXy = irisCoords.reduce((a, b, i) => a + b * screenCoords[i], 0);
  const sumYawY = yaw.reduce((a, b, i) => a + b * screenCoords[i], 0);
  const sumPitchY = pitch.reduce((a, b, i) => a + b * screenCoords[i], 0);

  // Sum of squares of each variable
  const sumXx = irisCoords.reduce((a, b) => a + b * b, 0);
  const sumYawYaw = yaw.reduce((a, b) => a + b * b, 0);
  const sumPitchPitch = pitch.reduce((a, b) => a + b * b, 0);

  // Computing linear regression
  // Here we perform multiple regression for irisCoords, yaw, and pitch.
  const denominator = (n * (sumXx + sumYawYaw + sumPitchPitch)) - (sumX + sumYaw + sumPitch) ** 2;
  const slopeIris = (n * sumXy - sumX * sumY) / denominator;
  const slopeYaw = (n * sumYawY - sumYaw * sumY) / denominator;
  const slopePitch = (n * sumPitchY - sumPitch * sumY) / denominator;
  const intercept = (sumY - (slopeIris * sumX + slopeYaw * sumYaw + slopePitch * sumPitch)) / n;

  return { slopeIris, slopeYaw, slopePitch, intercept };
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