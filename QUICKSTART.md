# Quick Start Guide

This guide will help you get the Solar Energy Estimator up and running in just a few minutes. **No credit card required!**

## Prerequisites Check

Before starting, make sure you have:

- [ ] Node.js (v16+) installed - Check with `node --version`
- [ ] npm installed - Check with `npm --version`
- [ ] A text editor (VS Code recommended)
- [ ] A web browser (Chrome, Firefox, Edge, or Safari)

## Step-by-Step Setup

### 1. Get Your NREL API Key (FREE - No Credit Card)

You only need ONE API key, and it's completely free:

#### NREL Developer (Required for solar data)

1. Visit [NREL Developer Signup](https://developer.nrel.gov/signup/)
2. Fill out the simple form (no credit card needed)
3. Check your email - your API key arrives instantly
4. Copy your API key

**That's it!** No other API keys needed.

### 2. Install Dependencies

Open a terminal in the project directory:

```bash
# Install all dependencies at once
npm run install:all
```

This single command installs dependencies for:
- Root project
- Backend server
- Frontend React app

### 3. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
copy .env.example .env
```

Open `backend/.env` in your text editor and add your NREL API key:

```env
PORT=5000
NREL_API_KEY=YOUR_NREL_KEY_HERE
```

#### Frontend Configuration

```bash
cd ../frontend
copy .env.example .env
```

The frontend `.env` should contain:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

That's all! No other configuration needed.

### 4. Start the Application

From the project root directory:

```bash
npm run dev
```

This starts both the backend and frontend servers.

You should see:
```
[backend] Server running on port 5000
[frontend] webpack compiled successfully
[frontend] Compiled successfully!
```

### 5. Open the App

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the Solar Energy Estimator interface with a map!

## First Use

### Try It Out

1. **Enter an address** in the search box, for example:
   ```
   1600 Amphitheatre Parkway, Mountain View, CA
   ```

2. **Click "Analyze Location"**
   - The map will zoom to your location with satellite imagery
   - The address will be geocoded using OpenStreetMap

3. **Add roof surfaces**
   - Click "Add Roof Surface"
   - View the satellite imagery to identify your roof
   - Configure each surface:
     - **kWp**: Panel capacity (try 5.0 for typical residential)
     - **Azimuth**: Direction (180° = South-facing, optimal)
     - **Pitch**: Roof angle (typical = 20°)

4. **Click "Calculate Energy Production"**
   - View interactive charts
   - See production estimates
   - Explore different time ranges

### Example Configuration

For a typical south-facing roof:
- **kWp**: 5.0
- **Azimuth**: 180° (south)
- **Pitch**: 20°
- **Area**: 30 m² (optional)

## Troubleshooting

### "Cannot find module" errors

Make sure all dependencies are installed:
```bash
npm run install:all
```

### Maps not loading

1. Check internet connection (maps load from external tile servers)
2. Clear browser cache
3. Check browser console for specific error messages

### Geocoding not working

1. Be specific with addresses (include city, state/province, country)
2. Nominatim has a rate limit of 1 request per second
3. Try a well-known address first to test

### Backend connection errors

1. Make sure the backend is running on port 5000
2. Check that `REACT_APP_API_URL` in `frontend/.env` is set to `http://localhost:5000/api`
3. Look for errors in the backend terminal

### NREL API errors

1. Verify `NREL_API_KEY` is set correctly in `backend/.env`
2. Make sure you're not exceeding the rate limit (1000 requests/hour)
3. Check that the API key is valid

## Next Steps

Now that you have the app running:

1. **Explore the features** - Try different addresses and configurations
2. **Read the full documentation** - Check out [README.md](README.md) for detailed info
3. **Customize it** - Modify the code to suit your needs
4. **Add features** - See the "Future Enhancements" section in [README.md](README.md)

## Development Tips

### Separate Terminal Windows

For better visibility, run backend and frontend in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

### Hot Reloading

Both backend and frontend support hot reloading:
- **Frontend**: Saves automatically refresh the browser
- **Backend**: nodemon restarts the server on file changes

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- ES7+ React/Redux/React-Native snippets

## What Makes This Different?

✅ **No Credit Card Required** - Unlike Google Maps, this uses free OpenStreetMap  
✅ **No API Limits** - NREL gives you 1000 requests/hour for free  
✅ **Privacy Friendly** - No tracking, no accounts (except NREL API key)  
✅ **Open Source** - Built with open-source mapping and free data  

## Getting Help

If you run into issues:

1. Check the **Troubleshooting** section above
2. Review the **[README.md](README.md)** for detailed documentation
3. Look at the **[API_DOCS.md](API_DOCS.md)** for API details
4. Open an issue on GitHub with:
   - What you were trying to do
   - What happened instead
   - Any error messages
   - Your Node.js version (`node --version`)

---

Happy solar estimating! ☀️
