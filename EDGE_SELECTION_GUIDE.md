# Edge Selection Feature

## Overview
Added manual edge selection capability for roof sections to improve accuracy of direction and pitch calculations.

## What Was Added

### 1. Core Utilities (`frontend/src/utils/edgeSelection.js`)
- **calculateAzimuthFromRidge()**: Calculates precise azimuth from user-specified ridge edge
- **calculatePitchFromEdges()**: Estimates roof pitch from ridge and eave edges
- **getPolygonEdges()**: Extracts all edges from polygon with metadata (length, bearing, midpoint)
- **findLikelyRidge()**: Auto-detects longest edge as suggested ridge
- **findLikelyEave()**: Finds parallel opposite edge to ridge
- **createEdgeMarkers()**: Prepares edge data for visualization

### 2. Edge Selector Component (`frontend/src/components/EdgeSelector.js`)
Interactive UI for selecting ridge (top) and eave (bottom) edges of a roof:
- Visual edge highlighting with color coding
- Step-by-step selection workflow
- Auto-suggestion of likely ridge edge
- Optional eave selection for pitch calculation
- Live edge metadata display (length, bearing)

### 3. Application Integration
- **App.js**: Added state management for edge editing mode
- **MapView.js**: Integrated EdgeSelector overlay on map
- **RoofEditor.js**: Added "Edit Roof Edges" button for each drawn roof section
- **index.css**: Added comprehensive styling for edge selector UI

## How to Use

### Step 1: Draw a Roof Section
1. Search for an address or click on the map
2. Click "Draw Roof Sections"
3. Use the polygon tool to outline a roof section
4. The app automatically calculates direction and area

### Step 2: Refine Direction (Optional)
If the automatic direction isn't accurate:
1. In the panel configuration, find the roof surface
2. Click "✏️ Edit Roof Edges (Refine Direction)"
3. The edge selector panel will appear on the map

### Step 3: Select Ridge Edge
1. Click on the edge that represents the **ridge** (top/peak) of the roof
   - OR click "⚡ Use Suggested Ridge" to auto-select the longest edge
2. Selected ridge turns **red**
3. The workflow advances to Step 2

### Step 4: Select Eave Edge (Optional)
1. Optionally click the edge that represents the **eave** (bottom) of the roof
2. Selected eave turns **green**
3. This helps calculate roof pitch more accurately
4. OR click "Skip & Use Default Pitch" to skip

### Step 5: Calculate
1. Click "✓ Calculate Direction & Pitch"
2. The roof section updates with the refined data
3. The corresponding panel updates automatically
4. Edge selector closes

## Color Coding

### Edge Colors in Selector
- 🔴 **Red**: Selected ridge (top edge)
- 🟢 **Green**: Selected eave (bottom edge)
- 🟠 **Orange**: Suggested ridge (longest edge)
- 🔵 **Blue**: Unselected edges

### Roof Section Colors (Map)
- 🟢 **Green**: Optimal direction (high efficiency)
- 🟡 **Yellow**: Good direction
- 🟠 **Orange**: Fair direction
- 🔴 **Red**: Poor direction (not recommended)

## Technical Details

### Hemisphere Awareness
The system automatically detects hemisphere based on latitude:
- **Northern Hemisphere** (lat ≥ 0): Optimal = South (180°)
- **Southern Hemisphere** (lat < 0): Optimal = North (0°)

### Azimuth Calculation
The ridge edge is used to calculate perpendicular azimuth:
1. Calculate bearing of ridge edge
2. Add 90° to get perpendicular direction
3. Optimize for hemisphere (choose side facing optimal direction)

### Pitch Estimation
When both ridge and eave are selected:
1. Calculate distance between ridge and eave midpoints
2. Estimate typical roof geometry
3. Default: 22° for residential roofs if not calculable

## Benefits
- ✅ More accurate azimuth calculations for complex roof geometries
- ✅ Better solar efficiency estimates
- ✅ User control over automatic detection
- ✅ Visual feedback during selection process
- ✅ Optional workflow - use only when needed

## Files Modified
1. `frontend/src/utils/edgeSelection.js` - NEW
2. `frontend/src/components/EdgeSelector.js` - NEW
3. `frontend/src/App.js` - Added edge selection state and handlers
4. `frontend/src/components/MapView.js` - Integrated EdgeSelector component
5. `frontend/src/components/RoofEditor.js` - Added edit edges button
6. `frontend/src/index.css` - Added edge selector styling
