// Types
interface Metal {
  name: string;
  atomicRadius: number;
  interatomicSpacing: number;
  soundSpeed: number;
  crystalStructure: 'BCC' | 'FCC' | 'HCP';
}

interface BowlDimensions {
  innerDiameter: number;
  outerDiameter: number;
  thickness: number;
}

interface BowlParameters {
  metal: string;
  averagedRadius: number;
  fundamentalWavelength: number;
  normalizedFrequency: number;
  availableOctaves: number[];
  selectedFrequency: number;
  dimensions: BowlDimensions;
  wavelengthInMetal: number;
  wavelengthInAir: number;
}

type MetalType = 'iron' | 'copper' | 'titanium' | 'brass';

// Constants
const METALS: Record<MetalType, Metal> = {
  iron: {
    name: 'Iron',
    atomicRadius: 140e-12,
    interatomicSpacing: 286.65e-12,
    soundSpeed: 5120,
    crystalStructure: 'BCC'
  },
  copper: {
    name: 'Copper',
    atomicRadius: 128e-12,
    interatomicSpacing: 361.49e-12,
    soundSpeed: 3810,
    crystalStructure: 'FCC'
  },
  titanium: {
    name: 'Titanium',
    atomicRadius: 147e-12,
    interatomicSpacing: 295.08e-12,
    soundSpeed: 4140,
    crystalStructure: 'HCP'
  },
  brass: {
    name: 'Brass',
    atomicRadius: 135e-12,
    interatomicSpacing: 330e-12,
    soundSpeed: 3475,
    crystalStructure: 'FCC'
  }
};

const AIR_SOUND_SPEED = 343; // m/s
const MIN_AUDIBLE_FREQ = 20; // Hz
const MAX_AUDIBLE_FREQ = 20000; // Hz

class SingingBowlCalculator {
  private metal: Metal;
  private thicknessRatio: number;
  private averagedRadius: number;

  constructor(metalType: MetalType = 'iron', thicknessRatio: number = 1.618) {
    this.metal = METALS[metalType];
    this.thicknessRatio = thicknessRatio;
    this.averagedRadius = this.calculateAveragedRadius();
  }

  private calculateAveragedRadius(): number {
    return (this.metal.atomicRadius + (this.metal.interatomicSpacing / 2)) / 2;
  }

  private calculateFundamentalFrequency(): number {
    return this.metal.soundSpeed / (2 * this.averagedRadius);
  }

  private normalizeToAudibleFrequency(): number {
    let freq = this.calculateFundamentalFrequency();
    
    // First get it below 20kHz
    while (freq > MAX_AUDIBLE_FREQ) {
      freq /= 2;
    }
    
    // Make sure it's above minimum audible
    while (freq < MIN_AUDIBLE_FREQ) {
      freq *= 2;
    }
    
    // Now go down 4 more octaves
    for (let i = 0; i < 4; i++) {
      const nextFreq = freq / 2;
      // Only go down if we'll stay above 20Hz
      if (nextFreq >= MIN_AUDIBLE_FREQ) {
        freq = nextFreq;
      } else {
        break;
      }
    }
    
    return freq;
  }

  private calculateWavelengthInMetal(frequency: number): number {
    return this.metal.soundSpeed / frequency;
  }

  private calculateWavelengthInAir(frequency: number): number {
    return AIR_SOUND_SPEED / frequency;
  }

  private calculateDimensions(frequency: number): BowlDimensions {
    const wavelengthInAir = this.calculateWavelengthInAir(frequency);
    const innerDiameter = wavelengthInAir;
    const outerDiameter = innerDiameter * this.thicknessRatio;
    const thickness = (outerDiameter - innerDiameter) / 2;

    return {
      innerDiameter,
      outerDiameter,
      thickness
    };
  }

getFrequencyOctaves(baseFreq: number): number[] {
  const octaves: number[] = [];
  let freq = baseFreq;
  
  // Add base frequency
  octaves.push(freq);
  
  // Go down in octaves
  while (true) {
    freq /= 2;
    if (freq >= MIN_AUDIBLE_FREQ) {
      octaves.push(freq);
    } else {
      break;
    }
  }
  
  // Reset to base and go up in octaves
  freq = baseFreq;
  while (true) {
    freq *= 2;
    if (freq <= MAX_AUDIBLE_FREQ) {
      octaves.push(freq);
    } else {
      break;
    }
  }
  
  return octaves.sort((a, b) => a - b);
}

  calculateBowlParameters(selectedOctave?: number): BowlParameters {
    const normalizedFreq = this.normalizeToAudibleFrequency();
    const availableOctaves = this.getFrequencyOctaves(normalizedFreq);
    const frequency = selectedOctave || normalizedFreq;
    const dimensions = this.calculateDimensions(frequency);

    return {
      metal: this.metal.name,
      averagedRadius: this.averagedRadius,
      fundamentalWavelength: 2 * this.averagedRadius,
      normalizedFrequency: normalizedFreq,
      availableOctaves,
      selectedFrequency: frequency,
      dimensions,
      wavelengthInMetal: this.calculateWavelengthInMetal(frequency),
      wavelengthInAir: this.calculateWavelengthInAir(frequency)
    };
  }

  getMetals(): Record<MetalType, Metal> {
    return METALS;
  }
}

export default SingingBowlCalculator;
export type { MetalType, BowlParameters, BowlDimensions };
