# Hemisphere-Aware Solar Panel Optimization

## Overview

The solar estimator now automatically detects which hemisphere you're in and adjusts all visual feedback, color coding, and default values to optimize for the best solar panel direction in your location.

## Key Features

### 🌍 Automatic Hemisphere Detection

- **Latitude-based**: Automatically determined from your location
- **Northern Hemisphere** (lat ≥ 0°): Optimizes for south-facing panels (180°)
- **Southern Hemisphere** (lat < 0°): Optimizes for north-facing panels (0°)

### 🎨 Hemisphere-Aware Color Scheme

#### Northern Hemisphere
| Direction | Azimuth Range | Color | Rating | Description |
|-----------|---------------|-------|--------|-------------|
| South ± 30° | 150° - 210° | 🟢 Green | Excellent | Best for solar production |
| SE/SW ± 30° | 120° - 150°, 210° - 240° | 🟡 Yellow | Good | Good solar production |
| E/W ± 30° | 60° - 120°, 240° - 300° | 🟠 Orange | Fair | Moderate solar production |
| North ± 60° | 0° - 60°, 300° - 360° | 🔴 Red | Poor | Minimal solar production |

#### Southern Hemisphere
| Direction | Azimuth Range | Color | Rating | Description |
|-----------|---------------|-------|--------|-------------|
| North ± 30° | 330° - 30° | 🟢 Green | Excellent | Best for solar production |
| NE/NW ± 30° | 30° - 60°, 300° - 330° | 🟡 Yellow | Good | Good solar production |
| E/W ± 30° | 60° - 120°, 240° - 300° | 🟠 Orange | Fair | Moderate solar production |
| South ± 60° | 120° - 240° | 🔴 Red | Poor | Minimal solar production |

### 📊 Smart Direction Calculation

When you draw a roof section, the algorithm:

1. **Detects hemisphere** from the latitude
2. **Finds the longest edge** (ridge line)
3. **Calculates both perpendicular directions** (roof could face either way)
4. **Chooses the optimal perpendicular** based on hemisphere:
   - Northern: Selects the one closest to 180° (south)
   - Southern: Selects the one closest to 0° (north)

### 💡 User Interface Adaptations

#### Location Header
Shows current hemisphere:
- "Northern Hemisphere detected - Optimal: South (180°)"
- "Southern Hemisphere detected - Optimal: North (0°)"

#### Drawing Mode Hints
Hemisphere-specific guidance:
- Northern: "🔷 South-facing roofs will be highlighted in green"
- Southern: "🔶 North-facing roofs will be highlighted in green"

#### Default Values
When manually adding panels:
- Northern Hemisphere: Default azimuth = 180° (south)
- Southern Hemisphere: Default azimuth = 0° (north)

#### Roof Labels
Each drawn section shows:
- Direction name (e.g., "North-East")
- Exact azimuth (e.g., "45°")
- Area (e.g., "42.5 m²")
- **Efficiency rating** (EXCELLENT/GOOD/FAIR/POOR) based on hemisphere

## Technical Implementation

### Core Functions

```javascript
// Determine hemisphere from latitude
getHemisphere(lat) → 'northern' | 'southern'

// Get optimal azimuth for hemisphere
getOptimalAzimuth(hemisphere) → 180 (north) | 0 (south)

// Calculate solar efficiency based on hemisphere
getSolarEfficiency(azimuth, hemisphere) → {
  rating: 'excellent' | 'good' | 'fair' | 'poor',
  color: '#28a745' | '#ffc107' | '#fd7e14' | '#dc3545',
  description: string
}

// Calculate roof azimuth with hemisphere optimization
calculateRoofAzimuth(coordinates, latitude) → azimuth (0-360)
```

### Angular Deviation Calculation

The efficiency is determined by the angular deviation from the optimal direction:

```javascript
// Calculate shortest angular distance (handles 360° wrap-around)
const diff = Math.min(
  Math.abs(azimuth - optimalAzimuth),
  360 - Math.abs(azimuth - optimalAzimuth)
);

// Rate based on deviation
if (diff < 30) return 'excellent';      // Within 30° of optimal
else if (diff < 60) return 'good';      // Within 60° of optimal
else if (diff < 90) return 'fair';      // Within 90° of optimal
else return 'poor';                     // More than 90° from optimal
```

## Examples by Location

### Northern Hemisphere Examples

| Location | Latitude | Optimal Direction | Color Coding |
|----------|----------|-------------------|--------------|
| New York, USA | 40.7° N | South (180°) | South = Green |
| London, UK | 51.5° N | South (180°) | South = Green |
| Tokyo, Japan | 35.7° N | South (180°) | South = Green |
| Cairo, Egypt | 30.0° N | South (180°) | South = Green |

### Southern Hemisphere Examples

| Location | Latitude | Optimal Direction | Color Coding |
|----------|----------|-------------------|--------------|
| Sydney, Australia | -33.9° S | North (0°) | North = Green |
| Auckland, NZ | -36.8° S | North (0°) | North = Green |
| Cape Town, SA | -33.9° S | North (0°) | North = Green |
| Santiago, Chile | -33.4° S | North (0°) | North = Green |

### Equatorial Regions

Near the equator (±10° latitude), both north and south-facing panels can be effective. The system still optimizes based on the hemisphere but the difference in efficiency is less pronounced.

## Testing Different Hemispheres

To test the hemisphere-aware features:

1. **Test Northern Hemisphere**:
   - Search: "New York City"
   - Draw a south-facing roof → Should show GREEN
   - Draw a north-facing roof → Should show RED

2. **Test Southern Hemisphere**:
   - Search: "Auckland, New Zealand"  
   - Draw a north-facing roof → Should show GREEN
   - Draw a south-facing roof → Should show RED

3. **Test Equator**:
   - Search: "Singapore" (1.3° N)
   - System treats as Northern but efficiency differences are minimal

## Benefits

✅ **Accurate worldwide** - Works correctly anywhere on Earth
✅ **No user configuration** - Automatically detects and adapts
✅ **Educational** - Users learn optimal panel orientation for their location
✅ **Visual clarity** - Clear color coding shows best options at a glance
✅ **Smart defaults** - New panels default to optimal direction

## Files Modified

- `frontend/src/utils/roofCalculations.js` - Hemisphere-aware calculations
- `frontend/src/components/MapView.js` - Visual feedback by hemisphere
- `frontend/src/components/RoofEditor.js` - Hemisphere indicator
- `frontend/src/App.js` - Default values based on hemisphere
- `ROOF_DRAWING.md` - Updated documentation
- `HEMISPHERE_FEATURES.md` - This file

## Future Enhancements

Potential improvements:
- 🌤️ Account for seasonal sun path variations
- 📈 Show hemisphere-specific energy production estimates
- 🗺️ Display sun path visualization on the map
- 📊 Compare efficiency across different roof orientations
- 🌍 Support for equatorial optimization (both directions good)
