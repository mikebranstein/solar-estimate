# Getting Started - Solar Energy Estimator

## 🎯 What You Need (5 Minutes Setup)

**Only one API key required - it's FREE and no credit card needed!**

### Step 1: Get NREL API Key (2 minutes)
1. Go to https://developer.nrel.gov/signup/
2. Enter your name and email
3. Check your email for instant API key
4. Copy the key

### Step 2: Install & Configure (2 minutes)

```bash
# Install dependencies
npm run install:all

# Configure backend
cd backend
copy .env.example .env
# Edit .env and paste your NREL API key

# Configure frontend  
cd ../frontend
copy .env.example .env
# No changes needed here!
```

### Step 3: Run the App (1 minute)

```bash
# From project root
npm run dev
```

Open http://localhost:3000

## ✅ Quick Test

1. Enter address: `1600 Amphitheatre Parkway, Mountain View, CA`
2. Click "Analyze Location" - see satellite map
3. Click "Add Roof Surface"
4. Configure:
   - kWp: `5.0`
   - Azimuth: `180` (south-facing)
   - Pitch: `20`
   - Enable checkbox: ✓
5. Click "Calculate Energy Production"
6. View your solar estimates!

## 🚨 Troubleshooting

**Maps not loading?**
- Check internet connection (uses OpenStreetMap tiles)

**Can't find address?**
- Be specific: include city, state, country
- Example: "123 Main St, San Francisco, CA, USA"

**Backend errors?**
- Make sure you added NREL API key to `backend/.env`
- Check terminal for error messages

**Still stuck?**
- Read [QUICKSTART.md](QUICKSTART.md) for detailed help
- Check [README.md](README.md) for full documentation

## 💡 What's Next?

- Try your own address
- Add multiple roof surfaces for different orientations
- Explore different time ranges in charts
- Adjust panel configurations to see how it affects output

## 🎉 You're All Set!

The app uses:
- ✅ **Free mapping** (OpenStreetMap + Leaflet)
- ✅ **Free geocoding** (Nominatim)
- ✅ **Free solar data** (NREL API - 1000 requests/hour)
- ✅ **No credit card**
- ✅ **No tracking or accounts**

Enjoy estimating your solar potential! ☀️
