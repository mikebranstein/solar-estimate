# Visual Guide: Hemisphere-Aware Color Scheme

## Color Coding System

The solar estimator uses a **4-tier color coding system** that adapts based on your hemisphere:

### 🎨 Color Palette

| Color | Hex Code | Rating | Deviation from Optimal |
|-------|----------|--------|------------------------|
| 🟢 Green | #28a745 | EXCELLENT | 0° - 30° |
| 🟡 Yellow | #ffc107 | GOOD | 30° - 60° |
| 🟠 Orange | #fd7e14 | FAIR | 60° - 90° |
| 🔴 Red | #dc3545 | POOR | 90° - 180° |

## Northern Hemisphere (e.g., USA, Europe, Asia)

### Optimal Direction: South (180°)

```
           North (0°)
              🔴
              ↑
              |
    315°      |      45°
     🔴       |       🔴
        \     |     /
         \    |    /
          \   |   /
       🟠  \  |  /  🟠
            \ | /
    270° --- + --- 90°  East
  West 🟠   / | \   🟠
           /  |  \
          /   |   \
         /    |    \
        /     |     \
     🟡       |       🟡
    225°      |      135°
              ↓
          South (180°)
              🟢

Legend:
🟢 Green (150-210°): EXCELLENT - Primary solar production
🟡 Yellow (120-150°, 210-240°): GOOD - Secondary choice
🟠 Orange (60-120°, 240-300°): FAIR - Limited production
🔴 Red (0-60°, 300-360°): POOR - Avoid if possible
```

### Example Roof Ratings (Northern Hemisphere):
- 180° South → 🟢 EXCELLENT
- 165° South-Southeast → 🟢 EXCELLENT
- 135° Southeast → 🟡 GOOD
- 90° East → 🟠 FAIR
- 45° Northeast → 🔴 POOR
- 0° North → 🔴 POOR

## Southern Hemisphere (e.g., Australia, NZ, South Africa)

### Optimal Direction: North (0°)

```
           North (0°)
              🟢
              ↑
              |
    315°      |      45°
     🟡       |       🟡
        \     |     /
         \    |    /
          \   |   /
       🟠  \  |  /  🟠
            \ | /
    270° --- + --- 90°  East
  West 🟠   / | \   🟠
           /  |  \
          /   |   \
         /    |    \
        /     |     \
     🔴       |       🔴
    225°      |      135°
              ↓
          South (180°)
              🔴

Legend:
🟢 Green (330-30°): EXCELLENT - Primary solar production
🟡 Yellow (30-60°, 300-330°): GOOD - Secondary choice
🟠 Orange (60-120°, 240-300°): FAIR - Limited production
🔴 Red (120-240°): POOR - Avoid if possible
```

### Example Roof Ratings (Southern Hemisphere):
- 0° North → 🟢 EXCELLENT
- 15° North-Northeast → 🟢 EXCELLENT
- 45° Northeast → 🟡 GOOD
- 90° East → 🟠 FAIR
- 135° Southeast → 🔴 POOR
- 180° South → 🔴 POOR

## Map Label Display

When you draw a roof section, the label appears in the center with:

```
┌─────────────────┐
│   South-East    │  ← Cardinal Direction
│      165°       │  ← Exact Azimuth
│    42.5 m²      │  ← Calculated Area
│   EXCELLENT     │  ← Efficiency Rating
└─────────────────┘
```

The **entire polygon** is colored with the efficiency color:
- **Border**: Solid color, 3px width
- **Fill**: Same color, 30% opacity
- **Label**: White background, colored border

## Comparison Examples

### Same Roof, Different Hemispheres

#### Roof facing 180° (South):

**Northern Hemisphere (New York):**
- Color: 🟢 Green
- Rating: EXCELLENT
- Reason: Perfect south orientation

**Southern Hemisphere (Sydney):**
- Color: 🔴 Red
- Rating: POOR
- Reason: Facing away from sun

#### Roof facing 0° (North):

**Northern Hemisphere (London):**
- Color: 🔴 Red
- Rating: POOR
- Reason: Facing away from sun

**Southern Hemisphere (Auckland):**
- Color: 🟢 Green
- Rating: EXCELLENT
- Reason: Perfect north orientation

## Color Accessibility

The color scheme is designed to be:
- ✅ **Colorblind-friendly**: 4-tier system with text labels
- ✅ **High contrast**: Colors are visually distinct
- ✅ **Semantic**: Green = good, Red = bad (universal)
- ✅ **Text-supported**: Rating labels reinforce color meaning

## Dynamic UI Elements

### Drawing Mode Banner

**Northern Hemisphere:**
```
┌────────────────────────────────────────────────────────┐
│ ✏️ Click the polygon tool on the right to draw roof   │
│    sections. 🔷 South-facing roofs will be            │
│    highlighted in green.                              │
└────────────────────────────────────────────────────────┘
```

**Southern Hemisphere:**
```
┌────────────────────────────────────────────────────────┐
│ ✏️ Click the polygon tool on the right to draw roof   │
│    sections. 🔶 North-facing roofs will be            │
│    highlighted in green.                              │
└────────────────────────────────────────────────────────┘
```

### Location Header

**Northern Hemisphere:**
```
┌──────────────────────────────────────────┐
│ 📍 Northern Hemisphere                   │
│ Optimal direction: South (180°)          │
└──────────────────────────────────────────┘
```

**Southern Hemisphere:**
```
┌──────────────────────────────────────────┐
│ 📍 Southern Hemisphere                   │
│ Optimal direction: North (0°)            │
└──────────────────────────────────────────┘
```

## Real-World Test Cases

### Test Case 1: Auckland, New Zealand (-36.8° S)
```
Drawing a typical house with 4 roof planes:

Roof A: 0° (North)
└─ Result: 🟢 Green - EXCELLENT - "Perfect for solar!"

Roof B: 90° (East)  
└─ Result: 🟠 Orange - FAIR - "Morning sun only"

Roof C: 180° (South)
└─ Result: 🔴 Red - POOR - "Minimal sun exposure"

Roof D: 270° (West)
└─ Result: 🟠 Orange - FAIR - "Afternoon sun only"
```

### Test Case 2: Berlin, Germany (52.5° N)
```
Drawing a typical house with 4 roof planes:

Roof A: 0° (North)
└─ Result: 🔴 Red - POOR - "Minimal sun exposure"

Roof B: 90° (East)
└─ Result: 🟠 Orange - FAIR - "Morning sun only"

Roof C: 180° (South)
└─ Result: 🟢 Green - EXCELLENT - "Perfect for solar!"

Roof D: 270° (West)
└─ Result: 🟠 Orange - FAIR - "Afternoon sun only"
```

## Summary

The hemisphere-aware color scheme ensures that:
1. ✅ Users immediately see which roofs are best for solar
2. ✅ Color coding is **always correct** for their location
3. ✅ No manual configuration needed
4. ✅ Educational - teaches optimal panel placement
5. ✅ Globally applicable - works anywhere on Earth
