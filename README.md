# ☀️ Solar Energy Estimator

A comprehensive web application that estimates solar panel energy generation using automated roof detection, Google Maps satellite imagery, and real solar irradiance data from NREL.

## Features

- 🏠 **Automated Roof Detection** - Uses Google Solar API to automatically detect roof surfaces, angles, and orientations
- 🗺️ **Google Maps Integration** - Satellite view of your property with interactive roof surface selection
- 📊 **Energy Production Calculations** - Accurate solar energy estimates based on:
  - Panel orientation (azimuth)
  - Roof pitch/tilt angle
  - Local solar irradiance data from NREL
  - System efficiency factors
- 📈 **Interactive Visualizations** - Chart.js powered charts with:
  - Hourly, daily, weekly, monthly, and yearly views
  - Drill-down capability
  - 25-year lifetime projections with degradation modeling
- 🔧 **Configurable Panel Setup** - Click on roof sections to configure kWp capacity for each surface

## Tech Stack

### Backend
- **Node.js** with Express
- **Google Maps API** for geocoding and location services
- **Google Solar API** for automated roof detection
- **NREL API** (National Renewable Energy Laboratory) for solar irradiance data

### Frontend
- **React** 18
- **@react-google-maps/api** for Maps integration
- **Chart.js** & react-chartjs-2 for visualizations
- **Axios** for API calls

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) and npm installed
- **Google Cloud Platform account** with:
  - Maps JavaScript API enabled
  - Solar API enabled (optional but recommended)
  - API key generated
- **NREL API key** (free, get from https://developer.nrel.gov/signup/)

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

3. Edit `.env` and add your API keys:
   ```env
   PORT=5000
   
   # Get from: https://console.cloud.google.com/
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   GOOGLE_SOLAR_API_KEY=your_google_solar_api_key_here
   
   # Get from: https://developer.nrel.gov/signup/
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

3. Edit `.env` and add your Google Maps API key:
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   REACT_APP_API_URL=http://localhost:5000/api
   ```

## Getting API Keys

### Google Maps & Solar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Solar API (for automated roof detection)
4. Go to "Credentials" and create an API key
5. (Optional) Restrict the API key to your domain for production

**Note:** Google Solar API may not be available in all regions. If unavailable, the app will fall back to manual roof configuration.

### NREL API Key

1. Go to [NREL Developer Network](https://developer.nrel.gov/signup/)
2. Sign up for a free account
3. Your API key will be emailed to you instantly
4. Free tier includes 1,000 requests per hour

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

1. **Enter Your Address**
   - Type your full address in the search box
   - Click "Analyze Location"

2. **View Roof Detection**
   - The app will automatically detect your roof surfaces
   - View them on the satellite map
   - Each roof segment shows its orientation and pitch

3. **Configure Solar Panels**
   - Enable roof segments you want to use
   - Enter the kWp (kilowatt peak) capacity for each segment
   - Example: A typical residential installation might be 5-10 kWp per roof surface

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
Geocode an address to coordinates
```json
{
  "address": "1600 Amphitheatre Parkway, Mountain View, CA"
}
```

### POST `/api/solar/detect-roof`
Detect roof surfaces
```json
{
  "address": "...",
  "lat": 37.4219999,
  "lng": -122.0840575
}
```

### POST `/api/solar/irradiance`
Get solar irradiance data
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

### "No roof data available"
- Google Solar API may not have coverage in your area
- You can still manually configure panels using estimated orientations

### Maps not loading
- Check that REACT_APP_GOOGLE_MAPS_API_KEY is set correctly in frontend/.env
- Verify Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for API errors

### NREL API errors
- Verify your NREL_API_KEY is correct in backend/.env
- Check that you haven't exceeded the rate limit (1000/hour)

### CORS errors
- Backend CORS is configured to accept all origins in development
- For production, update CORS settings in backend/server.js

## Future Enhancements

- [ ] Manual roof tracing with drawing tools
- [ ] Cost estimation and ROI calculations
- [ ] Export reports as PDF
- [ ] Save/load projects
- [ ] Weather pattern integration
- [ ] Shading analysis
- [ ] Battery storage modeling
- [ ] Electricity rate optimization
- [ ] User authentication and project storage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **NREL** for providing free solar irradiance data
- **Google** for Maps and Solar APIs
- **Chart.js** for visualization capabilities

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ☀️ for a sustainable future
