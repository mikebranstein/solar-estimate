# Roof Section Drawing Feature

## Overview

The solar estimator now includes an interactive roof section drawing tool that automatically calculates the cardinal direction (azimuth) and area of each roof section you draw. **The system is hemisphere-aware** and optimizes for the best solar orientation based on your location.

## How It Works

### 1. **Enable Drawing Mode**
- Search for or click on a location on the map
- The system automatically detects your hemisphere (Northern or Southern)
- Click the **"✏️ Draw Roof Sections"** button in the sidebar
- The map will switch to drawing mode

### 2. **Draw a Roof Section**
- Click the **polygon tool** on the right side of the map
- Click points around the outline of a roof section
- Complete the shape by clicking on the first point again
- The system will automatically:
  - Calculate the cardinal direction the roof faces
  - Calculate the area of the section
  - Create a panel configuration with these values
  - **Optimize direction for your hemisphere**

### 3. **Automatic Direction Calculation**

The system uses a smart, hemisphere-aware algorithm:

1. **Detects hemisphere** - Based on latitude (positive = Northern, negative = Southern)
2. **Finds the longest edge** - This is typically the ridge line of the roof
3. **Calculates perpendicular** - The roof faces perpendicular to the ridge
4. **Converts to azimuth** - Expressed as degrees (0°=North, 90°=East, 180°=South, 270°=West)
5. **Optimizes for hemisphere**:
   - **Northern Hemisphere**: Prefers south-facing (180°)
   - **Southern Hemisphere**: Prefers north-facing (0°)

### 4. **Visual Feedback**

Each drawn roof section is color-coded based on solar efficiency **for your hemisphere**:

#### Northern Hemisphere:
- **Green** 🔷 - Facing south (±30°) - Excellent for solar
- **Yellow** - Facing SE/SW (±60°) - Good for solar
- **Orange** - Facing E/W (±90°) - Fair for solar
- **Red** - Facing north - Poor for solar

#### Southern Hemisphere:
- **Green** 🔶 - Facing north (±30°) - Excellent for solar
- **Yellow** - Facing NE/NW (±60°) - Good for solar
- **Orange** - Facing E/W (±90°) - Fair for solar
- **Red** - Facing south - Poor for solar

The label shows:
- Cardinal direction (e.g., "South-East")
- Exact azimuth angle (e.g., "165°")
- Calculated area (e.g., "45.2 m²")
- Efficiency rating (EXCELLENT, GOOD, FAIR, POOR)

### 5. **Edit or Delete Sections**

- Use the **edit tool** (pencil icon) to modify drawn sections
- Use the **trash tool** to delete sections
- Editing will recalculate direction and area automatically

### 6. **Configure Solar Panels**

After drawing sections:
- Each section automatically creates a panel entry
- Set the **Panel Capacity (kWp)** based on your solar panels
- Adjust **Pitch/Tilt** to match the roof angle
- The **Azimuth** and **Area** are pre-filled from your drawing
- Click **"Calculate Energy Production"** to see results

## Technical Details

### Azimuth Calculation

```javascript
// The algorithm:
1. Find longest edge in polygon (ridge line)
2. Calculate bearing of that edge
3. Add 90° to get perpendicular direction
4. Choose perpendicular closer to 180° (south)
```

### Area Calculation

Uses the spherical excess formula adapted for geographic coordinates, accounting for Earth's curvature. Results are in square meters (m²).

### Cardinal Directions

- **0°** - North
- **45°** - North-East
- **90°** - East
- **135°** - South-East
- **180°** - South (optimal for Northern Hemisphere)
- **225°** - South-West
- **270°** - West
- **315°** - North-West

## Tips for Best Results

1. **Zoom in close** - Use satellite imagery at zoom level 19-22 for accuracy
2. **Draw accurately** - Follow the actual roof edges for precise measurements
3. **Separate sections** - Draw each distinct roof plane separately
4. **Complex roofs** - Break complex roofs into multiple simple polygons
5. **Flat roofs** - For flat roofs, the direction represents the optimal panel orientation

## Example Workflow

### Northern Hemisphere (e.g., New York, London, Tokyo):
```
1. Search: "123 Main Street, New York"
2. System detects: Northern Hemisphere
3. Zoom to roof level (satellite view)
4. Click "Draw Roof Sections"
5. Draw outline of south-facing roof plane
   → System calculates: South (180°), 42.5 m² - EXCELLENT ✅
6. Draw outline of north-facing roof plane
   → System calculates: North (0°), 38.2 m² - POOR ❌
7. Click "Done Drawing"
8. Set kWp values for each section
9. Set pitch angles (e.g., 20° for typical pitched roof)
10. Calculate energy production
```

### Southern Hemisphere (e.g., Sydney, Cape Town, Auckland):
```
1. Search: "123 Main Street, Auckland"
2. System detects: Southern Hemisphere
3. Zoom to roof level (satellite view)
4. Click "Draw Roof Sections"
5. Draw outline of north-facing roof plane
   → System calculates: North (0°), 42.5 m² - EXCELLENT ✅
6. Draw outline of south-facing roof plane
   → System calculates: South (180°), 38.2 m² - POOR ❌
7. Click "Done Drawing"
8. Set kWp values for each section
9. Set pitch angles (e.g., 20° for typical pitched roof)
10. Calculate energy production
```

## Files Modified

- `frontend/src/utils/roofCalculations.js` - Calculation utilities
- `frontend/src/components/MapView.js` - Drawing controls and visualization
- `frontend/src/App.js` - State management and integration
- `frontend/src/index.css` - Styling for roof labels

## Dependencies

- `leaflet-draw` - Provides polygon drawing tools
- `react-leaflet` - React integration for Leaflet maps
