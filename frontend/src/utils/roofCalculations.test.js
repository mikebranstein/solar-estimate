// Test the roof calculation functions
import { calculateRoofAzimuth, calculatePolygonArea, getCardinalDirection } from './roofCalculations';

// Example test cases
console.log('=== Roof Direction Calculation Tests ===\n');

// Test 1: Simple rectangle aligned north-south
const testRoof1 = [
  { lat: 40.7128, lng: -74.0060 },  // Bottom-left
  { lat: 40.7130, lng: -74.0060 },  // Top-left
  { lat: 40.7130, lng: -74.0058 },  // Top-right
  { lat: 40.7128, lng: -74.0058 }   // Bottom-right
];

const azimuth1 = calculateRoofAzimuth(testRoof1);
const direction1 = getCardinalDirection(azimuth1);
const area1 = calculatePolygonArea(testRoof1);

console.log('Test 1: North-South aligned rectangle');
console.log(`Azimuth: ${azimuth1}°`);
console.log(`Direction: ${direction1}`);
console.log(`Area: ${area1} m²\n`);

// Test 2: Simple rectangle aligned east-west
const testRoof2 = [
  { lat: 40.7128, lng: -74.0060 },
  { lat: 40.7128, lng: -74.0058 },
  { lat: 40.7130, lng: -74.0058 },
  { lat: 40.7130, lng: -74.0060 }
];

const azimuth2 = calculateRoofAzimuth(testRoof2);
const direction2 = getCardinalDirection(azimuth2);
const area2 = calculatePolygonArea(testRoof2);

console.log('Test 2: East-West aligned rectangle');
console.log(`Azimuth: ${azimuth2}°`);
console.log(`Direction: ${direction2}`);
console.log(`Area: ${area2} m²\n`);

// Test 3: Pentagon (more complex shape)
const testRoof3 = [
  { lat: 40.7128, lng: -74.0060 },
  { lat: 40.7130, lng: -74.0060 },
  { lat: 40.7131, lng: -74.0059 },
  { lat: 40.7130, lng: -74.0058 },
  { lat: 40.7128, lng: -74.0058 }
];

const azimuth3 = calculateRoofAzimuth(testRoof3);
const direction3 = getCardinalDirection(azimuth3);
const area3 = calculatePolygonArea(testRoof3);

console.log('Test 3: Pentagon shape');
console.log(`Azimuth: ${azimuth3}°`);
console.log(`Direction: ${direction3}`);
console.log(`Area: ${area3} m²\n`);

// Test all cardinal directions
console.log('=== Cardinal Direction Conversion ===\n');
const testAzimuths = [0, 45, 90, 135, 180, 225, 270, 315, 360];
testAzimuths.forEach(az => {
  console.log(`${az}° = ${getCardinalDirection(az)}`);
});
