// Sprint M3.3 — Multi-Resolution & Normalized Waveform Generator

import type { MultiResolutionWaveform, WaveformResolution } from '../Models/AudioModels';

export class WaveformGenerator {
  /**
   * Generate Low (50), Medium (200), High (500) data points and 0.0 - 1.0 normalized waveform points.
   */
  public static generateWaveform(sizeBytes: number, durationSeconds: number): MultiResolutionWaveform {
    const lowRes = this.generatePoints(50, sizeBytes);
    const mediumRes = this.generatePoints(200, sizeBytes);
    const highRes = this.generatePoints(500, sizeBytes);
    
    // Normalize values between 0.0 and 1.0
    const normalizedPoints = mediumRes.points.map((val) => parseFloat((val / 100).toFixed(2)));

    return {
      lowRes,
      mediumRes,
      highRes,
      normalized: { points: normalizedPoints },
      sampleCount: 500,
    };
  }

  private static generatePoints(count: number, seed: number): WaveformResolution {
    const points: number[] = [];
    for (let i = 0; i < count; i++) {
      // Deterministic waveform curve simulation based on audio amplitude curve
      const amp = Math.abs(Math.sin((i / count) * Math.PI * 4) * 75 + ((seed + i) % 25));
      points.push(Math.min(100, Math.max(10, Math.round(amp))));
    }
    return { points };
  }
}
