'use client';

import { useState, useEffect } from 'react';
import Bowl3DPreview from '@/components/Bowl3DPreview';
import SingingBowlCalculator, { MetalType, BowlParameters } from '@/lib/singingBowlCalculator';

export default function Home() {
  const [metal, setMetal] = useState<MetalType>('iron');
  const [thicknessNum, setThicknessNum] = useState('531441');
  const [thicknessDenom, setThicknessDenom] = useState('524288');
  const [pendingThicknessNum, setPendingThicknessNum] = useState('531441');
  const [pendingThicknessDenom, setPendingThicknessDenom] = useState('524288');
  const [shapeType, setShapeType] = useState<'hemisphere' | 'parabolic'>('hemisphere');
  
  // Calculate initial thickness ratio from numerator and denominator
  const initialThicknessRatio = parseFloat(thicknessNum) / parseFloat(thicknessDenom);
  const [thicknessRatio, setThicknessRatio] = useState(initialThicknessRatio.toString());

  const [calculator, setCalculator] = useState(() => 
    new SingingBowlCalculator(metal, initialThicknessRatio)
  );
  
  const [params, setParams] = useState<BowlParameters>(() => 
    calculator.calculateBowlParameters()
  );
  
  const [selectedOctave, setSelectedOctave] = useState<string>(
    params.normalizedFrequency.toString()
  );

  useEffect(() => {
    const newCalculator = new SingingBowlCalculator(metal, parseFloat(thicknessRatio));
    setCalculator(newCalculator);
    setParams(newCalculator.calculateBowlParameters(parseFloat(selectedOctave)));
  }, [metal, thicknessRatio, selectedOctave]);

  const handleThicknessUpdate = () => {
    const numValue = parseFloat(pendingThicknessNum);
    const denomValue = parseFloat(pendingThicknessDenom);
    if (!isNaN(numValue) && !isNaN(denomValue) && denomValue !== 0) {
      setThicknessNum(pendingThicknessNum);
      setThicknessDenom(pendingThicknessDenom);
      setThicknessRatio((numValue / denomValue).toString());
    }
  };

  return (
    <main className="flex min-h-screen p-8 gap-8">
      {/* Left side - bowl preview */}
      <div className="flex-1 border rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Bowl Preview</h2>
        <Bowl3DPreview 
          dimensions={params.dimensions}
          shape={shapeType}
        />
      </div>

      {/* Right side - controls and parameters */}
      <div className="w-96 flex flex-col gap-6 text-black">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Metal Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Metal Selection</label>
            <div className="flex flex-col space-y-2">
              {(['iron', 'copper', 'titanium', 'brass'] as MetalType[]).map((metalType) => (
  <div key={metalType} className="flex items-center space-x-2">
    <input
      type="radio"
      id={metalType}
      name="metal"
      value={metalType}
      checked={metal === metalType}
      onChange={(e) => {
        const newMetal = e.target.value as MetalType;
        setMetal(newMetal);
        
        // Create new calculator with new metal
        const newCalculator = new SingingBowlCalculator(newMetal, parseFloat(thicknessRatio));
        
        // Get all parameters with current frequency
        let newParams = newCalculator.calculateBowlParameters(parseFloat(selectedOctave));
        
        // If current frequency isn't available in new metal's octaves,
        // use the normalized frequency of the new metal
        if (!newParams.availableOctaves.includes(parseFloat(selectedOctave))) {
          setSelectedOctave(newParams.normalizedFrequency.toString());
          newParams = newCalculator.calculateBowlParameters(newParams.normalizedFrequency);
        }
        
        setCalculator(newCalculator);
        setParams(newParams);
      }}
      className="w-4 h-4"
    />
    <label htmlFor={metalType} className="text-sm">
      {metalType.charAt(0).toUpperCase() + metalType.slice(1)}
    </label>
  </div>
))}
            </div>
          </div>

          {/* Shape Selection */}
          <div className="space-y-2 text-black">
            <label className="text-sm font-medium">Bowl Shape</label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="hemisphere"
                  name="shapeType"
                  value="hemisphere"
                  checked={shapeType === 'hemisphere'}
                  onChange={(e) => setShapeType(e.target.value as 'hemisphere' | 'parabolic')}
                  className="w-4 h-4"
                />
                <label htmlFor="hemisphere" className="text-sm">Hemisphere</label>
              </div>
              <div className="flex items-center space-x-2 text-black">
                <input
            //      type="radio"
            //      id="parabolic"
            //      name="shapeType"
            //      value="parabolic"
            //      checked={shapeType === 'parabolic'}
            //      onChange={(e) => setShapeType(e.target.value as 'hemisphere' | 'parabolic')}
            //      className="w-4 h-4"
                />
                <label htmlFor="parabolic" className="text-sm"></label>
              </div>
            </div>
          </div>

          {/* Frequency Selection */}
          <div className="space-y-2 text-black">
            <label className="text-sm font-medium">Frequency Selection</label>
            <select
              value={selectedOctave}
              onChange={(e) => setSelectedOctave(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-black"
            >
              {params.availableOctaves.map((freq) => (
                <option key={freq} value={freq.toString()}>
                  {freq.toFixed(2)} Hz
                </option>
              ))}
            </select>
          </div>

          {/* Thickness Ratio */}
          <div className="space-y-2 text-black">
            <label className="text-sm font-medium">Thickness Ratio (default: Pythagorean Comma) </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={pendingThicknessNum}
                onChange={(e) => setPendingThicknessNum(e.target.value)}
                className="w-24 px-2 py-1 border rounded-md text-black text-sm"
                placeholder="Numerator"
              />
              <span className="text-xl">/</span>
              <input
                type="number"
                value={pendingThicknessDenom}
                onChange={(e) => setPendingThicknessDenom(e.target.value)}
                className="w-24 px-2 py-1 border rounded-md text-black text-sm"
                placeholder="Denominator"
              />
              <button
                onClick={handleThicknessUpdate}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm whitespace-nowrap"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Parameters Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-2 text-black">
            <p><span className="font-semibold">Averaged Atomic Radius:</span> {formatNumber(params.averagedRadius)}</p>
            <p><span className="font-semibold">Fundamental Wavelength:</span> {formatNumber(params.fundamentalWavelength)}</p>
            <p><span className="font-semibold">Selected Frequency:</span> {formatFrequency(params.selectedFrequency)}</p>
            <p><span className="font-semibold">Wavelength in Metal:</span> {formatNumber(params.wavelengthInMetal)}</p>
            <p><span className="font-semibold">Wavelength in Air:</span> {formatNumber(params.wavelengthInAir)}</p>
            <p><span className="font-semibold">Inner Diameter:</span> {formatNumber(params.dimensions.innerDiameter)}</p>
            <p><span className="font-semibold">Outer Diameter:</span> {formatNumber(params.dimensions.outerDiameter)}</p>
            <p><span className="font-semibold">Thickness:</span> {formatNumber(params.dimensions.thickness)}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

// Utility functions for formatting
function formatNumber(num: number): string {
  if (num < 0.000001) {
    return `${(num * 1e12).toFixed(2)} picometers`;
  } else if (num < 0.001) {
    return `${(num * 1e9).toFixed(2)} nanometers`;
  } else if (num < 1) {
    return `${(num * 1000).toFixed(2)} millimeters`;
  } else {
    return `${num.toFixed(2)} meters`;
  }
}

function formatFrequency(freq: number): string {
  return `${freq.toFixed(2)} Hz`;
}
