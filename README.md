# ☀️ Solar Energy Estimator

A comprehensive web application that estimates solar panel energy generation using OpenStreetMap, Leaflet for interactive maps, and real solar irradiance data from NREL. **No credit card or Google API key required!**

## Features

- 🗺️ **Free Mapping** - Uses Leaflet with OpenStreetMap and satellite imagery (no API key needed)
- 🖱️ **Click-to-Select Location** - Click anywhere on the map or search by address
- 🏠 **Manual Roof Configuration** - Easy interface to configure multiple roof surfaces
- 📊 **Energy Production Calculations** - Accurate solar energy estimates based on:
  - Panel orientation (azimuth)
  - Roof pitch/tilt angle
  - Local solar irradiance data from NREL
  - System efficiency factors
- 📈 **Interactive Visualizations** - Chart.js powered charts with:
  - Hourly, daily, weekly, monthly, and yearly views
  - Drill-down capability
  - 25-year lifetime projections with degradation modeling
- 🔧 **Configurable Panel Setup** - Add multiple roof surfaces with different orientations
- 🆓 **Completely Free** - No credit card, no API limits (except NREL's generous free tier)

## Tech Stack

### Backend
- **Node.js** with Express
- **Nominatim** (OpenStreetMap) for free geocoding
- **NREL API** (National Renewable Energy Laboratory) for solar irradiance data

### Frontend
- **React** 18
- **Leaflet** & react-leaflet for maps
- **Chart.js** & react-chartjs-2 for visualizations
- **Axios** for API calls

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) and npm installed
- **NREL API key** (free, get from https://developer.nrel.gov/signup/)
  - No credit card required
  - 1,000 requests per hour free tier

## Installation

1. **Clone the repository**
   ```bash
   cd solar-estimate
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   This will install dependencies for the root, backend, and frontend.

   Alternatively, install each separately:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

## Configuration

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env` and add your NREL API key:
   ```env
   PORT=5000
   
   # Get from: https://developer.nrel.gov/signup/ (FREE, no credit card)
   NREL_API_KEY=your_nrel_api_key_here
   ```

### Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

3. The frontend needs minimal configuration:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

That's it! No Google API key needed.

## Getting API Keys

### NREL API Key (Required - FREE)

1. Go to [NREL Developer Network](https://developer.nrel.gov/signup/)
2. Sign up for a free account (no credit card required)
3. Your API key will be emailed to you instantly
4. Free tier includes **1,000 requests per hour**
5. Add it to `backend/.env`

## Running the Application

### Development Mode

From the root directory, run both backend and frontend simultaneously:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:3000

### Run Backend Only

```bash
npm run server
```
or
```bash
cd backend
npm run dev
```

### Run Frontend Only

```bash
npm run client
```
or
```bash
cd frontend
npm start
```

## Production Build

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the backend:
   ```bash
   cd backend
   npm start
   ```

3. Serve the frontend build folder with your preferred static file server or configure Express to serve it.

## How to Use

1. **Select Your Location**
   
   **Option A: Search by Address**
   - Type your full address in the search box
   - Click "Analyze Location"
   
   **Option B: Click on Map**
   - Click anywhere on the map to select a location
   - Perfect when address search doesn't work or for remote locations
   
   The map will show satellite imagery of your location

2. **Add Roof Surfaces**
   - Click "Add Roof Surface" to add each section of your roof
   - View the satellite imagery to identify different roof orientations
   - Add separate surfaces for each direction (e.g., south-facing, east-facing)

3. **Configure Each Surface**
   - **Enable** the surfaces you want to use
   - **kWp (kilowatt peak)**: Total panel capacity for this surface (e.g., 5.0)
   - **Azimuth**: Direction the roof faces
     - 0° = North
     - 90° = East
     - 180° = South (optimal in Northern Hemisphere)
     - 270° = West
   - **Pitch/Tilt**: Roof angle (0° = flat, typical roof = 15-30°)
   - **Area**: Optional, roof surface area in m²

4. **Calculate Energy Production**
   - Click "Calculate Energy Production"
   - View interactive charts showing:
     - Hourly production patterns
     - Daily/weekly variation
     - Monthly seasonal changes
     - Yearly production over panel lifetime

5. **Explore Visualizations**
   - Switch between time ranges (hourly, daily, weekly, monthly, yearly)
   - Toggle between bar and line charts
   - View production summaries

## Project Structure

```
solar-estimate/
├── backend/
│   ├── routes/
│   │   ├── solar.js          # Solar calculation endpoints
│   │   └── maps.js           # Geocoding and maps endpoints
│   ├── services/
│   │   ├── nrel.js           # NREL API integration
│   │   ├── google-maps.js    # Google Maps/Solar API
│   │   └── roofDetection.js  # Roof detection logic
│   ├── utils/
│   │   └── energyCalculator.js # Energy production calculations
│   ├── server.js             # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddressSearch.js
│   │   │   ├── MapView.js
│   │   │   ├── RoofEditor.js
│   │   │   └── EnergyChart.js
│   │   ├── services/
│   │   │   └── api.js        # API client
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── package.json              # Root package for scripts

```

## API Endpoints

### POST `/api/maps/geocode`
Geocode an address to coordinates using Nominatim
```json
{
  "address": "1600 Amphitheatre Parkway, Mountain View, CA"
}
```

### POST `/api/solar/detect-roof`
Initialize roof configuration for a location
```json
{
  "address": "...",
  "lat": 37.4219999,
  "lng": -122.0840575
}
```

### POST `/api/solar/irradiance`
Get solar irradiance data from NREL
```json
{
  "lat": 37.4219999,
  "lng": -122.0840575
}
```

### POST `/api/solar/calculate`
Calculate energy production
```json
{
  "panels": [
    {
      "id": 0,
      "kWp": 5.0,
      "azimuth": 180,
      "pitch": 20
    }
  ],
  "irradianceData": { ... },
  "timeRange": "monthly"
}
```

## Troubleshooting

### Maps not loading
- Clear browser cache
- Check browser console for errors
- Ensure you have internet connection (tiles load from external sources)

### Geocoding errors
- Nominatim has rate limits (max 1 request/second)
- Be specific with addresses
- Include city, state, and country for best results

### NREL API errors
- Verify your NREL_API_KEY is correct in backend/.env
- Check that you haven't exceeded the rate limit (1000/hour)
- Ensure the API key is valid

### CORS errors
- Backend CORS is configured to accept all origins in development
- For production, update CORS settings in backend/server.js

## Future Enhancements

- [ ] Drawing tools for manual roof tracing on the map
- [ ] Automated roof detection integration (if available)
- [ ] Cost estimation and ROI calculations
- [ ] Export reports as PDF
- [ ] Save/load projects
- [ ] Weather pattern integration
- [ ] Shading analysis
- [ ] Battery storage modeling
- [ ] Electricity rate optimization
- [ ] User authentication and project storage
- [ ] 3D roof visualization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **NREL** for providing free solar irradiance data
- **OpenStreetMap** contributors for free mapping data
- **Leaflet** for the excellent mapping library
- **Esri** for satellite imagery tiles
- **Chart.js** for visualization capabilities

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ☀️ for a sustainable future
