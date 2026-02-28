# API Documentation

## Overview

The Solar Estimator API provides endpoints for geocoding addresses, detecting roof surfaces, fetching solar irradiance data, and calculating energy production estimates.

Base URL: `http://localhost:5000/api`

## Authentication

Currently, no authentication is required for the API. API keys for external services (Google Maps, NREL) are configured server-side.

## Endpoints

### Maps

#### Geocode Address

Convert a physical address to geographic coordinates.

**Endpoint:** `POST /api/maps/geocode`

**Request Body:**
```json
{
  "address": "1600 Amphitheatre Parkway, Mountain View, CA 94043"
}
```

**Response:**
```json
{
  "formattedAddress": "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",
  "lat": 37.4220656,
  "lng": -122.0840897,
  "bounds": {
    "northeast": { "lat": 37.4234145802915, "lng": -122.0827407197085 },
    "southwest": { "lat": 37.4207166197085, "lng": -122.0854386802915 }
  },
  "placeId": "ChIJtYuu0V25j4ARwu5e4wwRYgE"
}
```

#### Get Building Insights

Retrieve building and roof data using Google Solar API.

**Endpoint:** `GET /api/maps/building/:lat/:lng`

**Parameters:**
- `lat` - Latitude (path parameter)
- `lng` - Longitude (path parameter)

**Response:**
```json
{
  "name": "...",
  "center": { "latitude": 37.422, "longitude": -122.084 },
  "solarPotential": {
    "maxArrayPanelsCount": 48,
    "maxArrayAreaMeters2": 120.5,
    "maxSunshineHoursPerYear": 1850,
    "panelCapacityWatts": 400
  },
  "roofSegments": [
    {
      "id": 0,
      "pitchDegrees": 20,
      "azimuthDegrees": 180,
      "stats": { ... }
    }
  ]
}
```

### Solar

#### Detect Roof

Detect roof surfaces for a given address or coordinates.

**Endpoint:** `POST /api/solar/detect-roof`

**Request Body:**
```json
{
  "address": "123 Main St, City, State ZIP",
  "lat": 37.422,
  "lng": -122.084
}
```

Note: Either `address` or both `lat` and `lng` are required.

**Response:**
```json
{
  "location": {
    "lat": 37.422,
    "lng": -122.084
  },
  "buildingInfo": {
    "center": { ... },
    "boundingBox": { ... },
    "imageryDate": { "year": 2023, "month": 8, "day": 15 }
  },
  "solarPotential": { ... },
  "roofSegments": [
    {
      "id": 0,
      "pitch": 20,
      "azimuth": 180,
      "area": 85.5,
      "sunshineHours": [1200, 1600, 1800],
      "groundArea": 80.2
    }
  ]
}
```

#### Get Solar Irradiance

Fetch solar irradiance data from NREL for a location.

**Endpoint:** `POST /api/solar/irradiance`

**Request Body:**
```json
{
  "lat": 37.422,
  "lng": -122.084
}
```

**Response:**
```json
{
  "location": {
    "lat": 37.422,
    "lng": -122.084,
    "elevation": 35
  },
  "avgDNI": 5.5,
  "avgGHI": 4.8,
  "avgTilt": 5.2,
  "monthly": {
    "jan": 3.5,
    "feb": 4.2,
    "mar": 5.1,
    "apr": 6.2,
    "may": 7.0,
    "jun": 7.5,
    "jul": 7.8,
    "aug": 7.2,
    "sep": 6.5,
    "oct": 5.3,
    "nov": 4.0,
    "dec": 3.2
  }
}
```

Values are in kWh/m²/day.

#### Calculate Energy Production

Calculate estimated energy production based on panel configuration.

**Endpoint:** `POST /api/solar/calculate`

**Request Body:**
```json
{
  "panels": [
    {
      "id": 0,
      "kWp": 5.0,
      "azimuth": 180,
      "pitch": 20,
      "area": 30
    },
    {
      "id": 1,
      "kWp": 3.5,
      "azimuth": 90,
      "pitch": 15,
      "area": 20
    }
  ],
  "irradianceData": {
    "location": { "lat": 37.422, "lng": -122.084 },
    "avgGHI": 4.8,
    "avgDNI": 5.5
  },
  "timeRange": "monthly"
}
```

**Time Range Options:**
- `hourly` - 24 hours
- `daily` - 30 days
- `weekly` - 52 weeks
- `monthly` - 12 months (default)
- `yearly` - 25 years

**Response:**
```json
{
  "summary": {
    "dailyProduction": 28.5,
    "monthlyProduction": 865.4,
    "yearlyProduction": 10398.5
  },
  "panelBreakdown": [
    {
      "panelId": 0,
      "kWp": 5.0,
      "dailyProduction": 18.2,
      "monthlyProduction": 554.1,
      "yearlyProduction": 6649.3
    },
    {
      "panelId": 1,
      "kWp": 3.5,
      "dailyProduction": 10.3,
      "monthlyProduction": 311.3,
      "yearlyProduction": 3749.2
    }
  ],
  "timeSeries": [
    {
      "label": "Jan",
      "value": 605.8,
      "timestamp": 1
    },
    {
      "label": "Feb",
      "value": 649.1,
      "timestamp": 2
    },
    ...
  ],
  "metadata": {
    "timeRange": "monthly",
    "systemEfficiency": 0.86,
    "performanceRatio": 0.75
  }
}
```

All energy values are in kWh.

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing required parameters)
- `404` - Not Found (no data available for location)
- `500` - Internal Server Error

## Rate Limits

Rate limits are determined by the external APIs:

- **NREL API:** 1,000 requests per hour (free tier)
- **Google Maps API:** Varies by billing plan

## Data Accuracy

Energy calculations use:
- System efficiency: 86%
- Performance ratio: 75%
- Panel degradation: 0.5% per year

These are typical industry values but may vary based on:
- Equipment quality
- Installation quality
- Local climate conditions
- Maintenance practices

For production systems, consider professional solar assessments.
