# Property Management Feature

## Overview

The Solar Energy Estimator now supports **multiple properties**, allowing you to save and manage different homes or buildings with their unique roof configurations, panel setups, and energy calculations.

## Key Features

### 🏠 Multiple Properties
- Save unlimited properties (homes, rental properties, businesses, etc.)
- Each property stores:
  - Location and address
  - All roof section drawings
  - Panel configurations and settings
  - Energy production calculations
  - Map zoom level

### 💾 Auto-Save
- All changes are **automatically saved** to your browser's local storage
- No "save" button needed - everything persists instantly
- Data survives browser restarts

### 🔄 Easy Switching
- Switch between properties with one click
- All property data loads instantly
- Continue where you left off on each property

## How to Use

### Creating Your First Property

1. **Search for a location** or click on the map
2. You'll be prompted: "Create a new property for [address]?"
3. Click **OK** to create the property
4. The property will be named automatically based on the address (you can rename it later)

### Using the Property Manager

#### Opening the Property Manager
- Click the **🏠 [Property Name]** button at the top of the app
- This opens a dropdown showing all your saved properties

#### Creating a New Property
1. Click the **+ New Property** button
2. Enter a name for your property (e.g., "My Home", "Rental Property", "Beach House")
3. Click **Create Property**
4. Search for or select the location

#### Switching Between Properties
1. Open the Property Manager dropdown
2. Click **Load This Property** on any property
3. All data for that property loads instantly:
   - Location and map position
   - Roof section drawings
   - Panel configurations
   - Energy calculations

#### Renaming a Property
1. Open the Property Manager
2. Click the **✎ (edit)** icon next to the property name
3. Type the new name
4. Press **Enter** or click the **✓** checkmark

#### Deleting a Property
1. Open the Property Manager
2. Click the **🗑 (trash)** icon
3. Confirm the deletion
4. ⚠️ **Warning**: This cannot be undone!

### Working with Properties

#### Drawing Roof Sections
1. Make sure you have a property selected (or create one)
2. Click **"✏️ Draw Roof Sections"**
3. Draw your roof outlines - they're automatically saved to the current property
4. All roof sections remain linked to this property

#### Configuring Panels
1. Add roof surfaces or use drawn sections
2. Configure panel capacity, azimuth, pitch, and area
3. All panel settings are automatically saved to the current property

#### Calculating Energy
1. Click **"Calculate Energy Production"**
2. Results are saved to the current property
3. Switch properties and calculate separately for each

## Property Information Display

Each property in the manager shows:

- **📍 Location**: Full address
- **🏘️ Roof Sections**: Number of drawn roof sections
- **⚡ Total Capacity**: Sum of all panel capacities (kWp)
- **📐 Total Area**: Total roof area covered
- **🕐 Last Updated**: When the property was last modified
- **Current Badge**: Shows which property is currently active

## Data Persistence

### What's Saved
- ✅ Property name
- ✅ Location (latitude, longitude, address)
- ✅ All roof section drawings (coordinates, directions, areas)
- ✅ All panel configurations
- ✅ Energy calculation results
- ✅ Map zoom level
- ✅ Creation and update timestamps

### Where It's Stored
- Data is stored in your browser's **localStorage**
- Each browser/device stores its own data
- Data persists until you:
  - Clear browser data
  - Manually delete properties

### Backup Your Data (Future Feature)
Currently, you can:
- Export properties (planned feature)
- Import/restore properties (planned feature)

## Tips and Best Practices

### Organizing Multiple Properties

**Use Descriptive Names**
- ✅ "123 Main St - Home"
- ✅ "Rental Unit #1 - Downtown"
- ✅ "Parents' House"
- ❌ "Property 1", "Test", "Untitled"

**One Property Per Building**
- Don't mix multiple buildings in one property
- Each property should represent one physical location

**Regular Reviews**
- Check the "Last Updated" date
- Update properties when you modify your roof or panels

### Analyzing Different Scenarios

You can create multiple properties for the **same location** to compare scenarios:
- "My Home - All South Panels"
- "My Home - East West Split"
- "My Home - Maximum Coverage"

### Deleting Old Properties
- Clean up test properties
- Remove properties you no longer need
- Free up browser storage

## Workflow Example

### Scenario: Managing Two Homes

**Step 1: Add First Home**
```
1. Click "New Property" → Enter "Main Residence"
2. Search for your home address
3. Draw roof sections (automatically saved)
4. Configure panels (automatically saved)
5. Calculate energy production (automatically saved)
```

**Step 2: Add Second Home**
```
1. Click "New Property" → Enter "Vacation Home"
2. Search for vacation home address
3. Draw different roof layout
4. Configure different panels
5. Calculate separate energy production
```

**Step 3: Compare Results**
```
1. Open Property Manager
2. Click "Main Residence" → See first home's data
3. Click "Vacation Home" → See second home's data
4. Compare total capacities and energy production
```

**Step 4: Update a Property**
```
1. Load "Main Residence"
2. Add another roof section
3. Changes auto-save immediately
4. Switch to "Vacation Home" - original data intact
```

## Troubleshooting

### Property Not Saving?
- Check browser console for errors
- Ensure localStorage is enabled
- Check available storage space

### Lost Your Data?
- Check if you're using the same browser
- Look in the Property Manager - data may still be there
- Don't clear browser data if you want to keep properties

### Can't Switch Properties?
- Make sure you click "Load This Property"
- Wait for the map to reload
- Check that the property name shows at the top

### Accidental Deletion?
- ⚠️ Deletions cannot be undone
- Be careful with the delete button
- Future versions will add export/backup

## Technical Details

### Storage Structure
Each property stores:
```javascript
{
  id: "unique-timestamp-id",
  name: "Property Name",
  createdAt: "2026-03-02T12:00:00.000Z",
  updatedAt: "2026-03-02T14:30:00.000Z",
  location: {
    lat: -36.8485,
    lng: 174.7633,
    formattedAddress: "Auckland, New Zealand"
  },
  roofSections: [...],  // All drawn roof polygons
  panels: [...],         // Panel configurations
  energyData: {...},     // Calculation results
  zoom: 21,
  nextPanelId: 3
}
```

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Any modern browser with localStorage support

### Storage Limits
- Typical limit: 5-10MB per domain
- Average property: ~50KB
- You can store 100+ properties comfortably

## Future Enhancements

Planned features:
- 📤 Export properties to JSON file
- 📥 Import properties from backup
- ☁️ Cloud sync (optional)
- 📊 Comparison view (side-by-side properties)
- 🏷️ Tags and categories
- 📸 Property photos
- 📝 Notes and comments per property

## Summary

The property management system lets you:
- ✅ Save unlimited properties
- ✅ Auto-save all changes
- ✅ Switch between properties instantly
- ✅ Keep roof drawings and panels organized
- ✅ Compare different locations
- ✅ Rename and delete as needed

All your solar analysis work is now **organized, saved, and easily accessible**!
