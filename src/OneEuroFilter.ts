export class OneEuroFilter {

  private freq: number; // Frequency of the signal
  private minCutoff: number; // Minimum cutoff frequency
  private beta: number; // Parameter for filtering
  private dcutoff: number; // Parameter for filtering
  private dx: number = 0; // Derivative of the signal
  private lastX: number | null = null; // Last filtered value
  private lastTime: number | null = null; // Last timestamp

  constructor(freq: number, minCutoff: number = 1.0, beta: number = 0.0, dcutoff: number = 1.0) {
    this.freq = freq;
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dcutoff = dcutoff;
  }

  // Calculate the alpha parameter based on the cutoff frequency
  private alpha(cutoff: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau * this.freq);
  }

  // Apply the one-euro filter to the input signal
  filter(x: number, timestamp: number): number {
    if (this.lastX === null || this.lastTime === null) {
      // If it's the first value, initialize the filter
      this.lastX = x;
      this.lastTime = timestamp;
      return x;
    }

    // Calculate the time difference between the current and last timestamp
    const deltaTime = timestamp - this.lastTime;
    // Calculate the frequency based on the time difference
    this.freq = 1.0 / deltaTime;
    this.lastTime = timestamp;

    // Calculate the derivative of the input signal
    const dx = (x - this.lastX) / deltaTime;
    // Apply the one-euro filter to the derivative
    const edx = this.dx + this.alpha(this.dcutoff) * (dx - this.dx);
    this.dx = edx;

    // Calculate the cutoff frequency based on the derivative
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    // Apply the one-euro filter to the input signal
    const filteredX = this.lastX + this.alpha(cutoff) * (x - this.lastX);
    this.lastX = filteredX;

    return filteredX;
  }
}
