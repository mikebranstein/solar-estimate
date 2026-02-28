# Quick Start Guide

This guide will help you get the Solar Energy Estimator up and running in just a few minutes.

## Prerequisites Check

Before starting, make sure you have:

- [ ] Node.js (v16+) installed - Check with `node --version`
- [ ] npm installed - Check with `npm --version`
- [ ] A text editor (VS Code recommended)
- [ ] A web browser (Chrome, Firefox, Edge, or Safari)

## Step-by-Step Setup

### 1. Get Your API Keys

You'll need API keys from two sources:

#### Google Cloud Platform (Required for core functionality)

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Click "Enable APIs and Services"
4. Enable these APIs:
   - **Maps JavaScript API** (required)
   - **Geocoding API** (required)
   - **Solar API** (optional, for automated roof detection)
5. Go to **Credentials** → **Create Credentials** → **API Key**
6. Copy your API key

**Important:** For testing, you can leave the API key unrestricted. For production, restrict it to your domain.

#### NREL Developer (Required for solar data)

1. Visit [NREL Developer Signup](https://developer.nrel.gov/signup/)
2. Fill out the simple form
3. Check your email - your API key arrives instantly
4. Copy your API key

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

Open `backend/.env` in your text editor and add your API keys:

```env
PORT=5000
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_KEY_HERE
GOOGLE_SOLAR_API_KEY=YOUR_GOOGLE_KEY_HERE
NREL_API_KEY=YOUR_NREL_KEY_HERE
```

#### Frontend Configuration

```bash
cd ../frontend
copy .env.example .env
```

Open `frontend/.env` and add your Google Maps key:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_KEY_HERE
REACT_APP_API_URL=http://localhost:5000/api
```

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

You should see the Solar Energy Estimator interface!

## First Use

### Try It Out

1. **Enter an address** in the search box, for example:
   ```
   1600 Amphitheatre Parkway, Mountain View, CA
   ```

2. **Click "Analyze Location"**
   - The map will zoom to your location
   - Roof surfaces will be detected (if available in your region)

3. **Configure panels**
   - Enable one or more roof segments
   - Enter the kWp capacity (try 5.0 for a typical residential setup)

4. **Click "Calculate Energy Production"**
   - View interactive charts
   - See production estimates
   - Explore different time ranges

### Example Addresses to Try

These locations have good Google Solar API coverage:

- `1600 Amphitheatre Parkway, Mountain View, CA` (Google HQ)
- `1 Apple Park Way, Cupertino, CA` (Apple Park)
- `410 Terry Ave N, Seattle, WA` (Amazon)

## Troubleshooting

### "Cannot find module" errors

Make sure all dependencies are installed:
```bash
npm run install:all
```

### Maps not loading

1. Check that `REACT_APP_GOOGLE_MAPS_API_KEY` is set in `frontend/.env`
2. Verify the API key is valid
3. Make sure Maps JavaScript API is enabled in Google Cloud Console
4. Check browser console for specific error messages

### "No roof data available"

Google Solar API doesn't have coverage everywhere. This is normal! You can still:
- Use the app by manually configuring panel orientations
- Try a different address in a major US city

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
2. **Read the full documentation** - Check out README.md for detailed info
3. **Customize it** - Modify the code to suit your needs
4. **Add features** - See the "Future Enhancements" section in README.md

## Getting Help

If you run into issues:

1. Check the **Troubleshooting** section above
2. Review the **README.md** for detailed documentation
3. Look at the **API_DOCS.md** for API details
4. Open an issue on GitHub with:
   - What you were trying to do
   - What happened instead
   - Any error messages
   - Your Node.js version (`node --version`)

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

---

Happy solar estimating! ☀️
