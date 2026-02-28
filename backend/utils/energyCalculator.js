/**
 * Calculate energy production for solar panels
 * Takes into account panel configuration, orientation, and solar irradiance data
 */
function calculateEnergyProduction(panels, irradianceData, timeRange = 'yearly') {
  const HOURS_PER_DAY = 24;
  const DAYS_PER_MONTH = 30.44; // Average
  const MONTHS_PER_YEAR = 12;
  const SYSTEM_EFFICIENCY = 0.86; // 86% system efficiency (accounts for inverter losses, wiring, etc.)
  const PERFORMANCE_RATIO = 0.75; // Real-world performance vs ideal conditions

  // Calculate production for each panel configuration
  let totalProduction = [];

  panels.forEach(panel => {
    const {
      kWp, // Kilowatt peak (panel capacity)
      azimuth, // Panel orientation (0 = North, 90 = East, 180 = South, 270 = West)
      pitch, // Panel tilt angle
      area // Panel area in square meters (optional)
    } = panel;

    // Calculate azimuth factor (South-facing is optimal in Northern Hemisphere)
    const azimuthFactor = calculateAzimuthFactor(azimuth);
    
    // Calculate tilt factor
    const tiltFactor = calculateTiltFactor(pitch, irradianceData.location.lat);
    
    // Base production calculation
    // Using average GHI (Global Horizontal Irradiance) from NREL data
    const avgDailyIrradiance = irradianceData.avgGHI / 365; // kWh/m²/day
    const peakSunHours = avgDailyIrradiance * azimuthFactor * tiltFactor;
    
    // Daily energy production
    const dailyProduction = kWp * peakSunHours * SYSTEM_EFFICIENCY * PERFORMANCE_RATIO;
    
    totalProduction.push({
      panelId: panel.id,
      kWp: kWp,
      dailyProduction: dailyProduction,
      monthlyProduction: dailyProduction * DAYS_PER_MONTH,
      yearlyProduction: dailyProduction * 365
    });
  });

  // Aggregate total production
  const aggregated = totalProduction.reduce((acc, panel) => {
    acc.dailyProduction += panel.dailyProduction;
    acc.monthlyProduction += panel.monthlyProduction;
    acc.yearlyProduction += panel.yearlyProduction;
    return acc;
  }, {
    dailyProduction: 0,
    monthlyProduction: 0,
    yearlyProduction: 0
  });

  // Generate time-series data based on timeRange
  let timeSeriesData = [];
  
  if (timeRange === 'hourly') {
    timeSeriesData = generateHourlyData(aggregated.dailyProduction, irradianceData);
  } else if (timeRange === 'daily') {
    timeSeriesData = generateDailyData(aggregated.dailyProduction, 30);
  } else if (timeRange === 'weekly') {
    timeSeriesData = generateWeeklyData(aggregated.dailyProduction, 52);
  } else if (timeRange === 'monthly') {
    timeSeriesData = generateMonthlyData(aggregated.monthlyProduction);
  } else {
    timeSeriesData = generateYearlyData(aggregated.yearlyProduction);
  }

  return {
    summary: aggregated,
    panelBreakdown: totalProduction,
    timeSeries: timeSeriesData,
    metadata: {
      timeRange,
      systemEfficiency: SYSTEM_EFFICIENCY,
      performanceRatio: PERFORMANCE_RATIO
    }
  };
}

/**
 * Calculate azimuth factor (orientation efficiency)
 * South-facing (180°) is optimal = 1.0
 */
function calculateAzimuthFactor(azimuth) {
  // Convert to radians
  const optimalAzimuth = 180; // South-facing
  const deviation = Math.abs(azimuth - optimalAzimuth);
  
  // Simple cosine-based factor
  // 0° deviation = 1.0, 90° deviation = 0.7, 180° deviation = 0.5
  if (deviation <= 90) {
    return 1.0 - (deviation / 90) * 0.3;
  } else {
    return 0.7 - ((deviation - 90) / 90) * 0.2;
  }
}

/**
 * Calculate tilt factor (angle efficiency)
 * Optimal tilt usually equals latitude
 */
function calculateTiltFactor(pitch, latitude) {
  const optimalTilt = Math.abs(latitude);
  const deviation = Math.abs(pitch - optimalTilt);
  
  // Tilt factor decreases with deviation from optimal
  if (deviation <= 15) {
    return 1.0;
  } else if (deviation <= 30) {
    return 0.95;
  } else if (deviation <= 45) {
    return 0.85;
  } else {
    return 0.75;
  }
}

/**
 * Generate hourly production data for a day
 */
function generateHourlyData(dailyProduction, irradianceData) {
  const hourlyData = [];
  const sunriseHour = 6;
  const sunsetHour = 20;
  const peakHour = 13; // 1 PM
  
  for (let hour = 0; hour < 24; hour++) {
    let production = 0;
    
    if (hour >= sunriseHour && hour <= sunsetHour) {
      // Simple bell curve for solar production
      const hoursFromPeak = Math.abs(hour - peakHour);
      const factor = Math.cos((hoursFromPeak / 7) * (Math.PI / 2));
      production = (dailyProduction / 10) * Math.max(0, factor); // Spread across ~10 hours
    }
    
    hourlyData.push({
      label: `${hour}:00`,
      value: Math.round(production * 100) / 100,
      timestamp: hour
    });
  }
  
  return hourlyData;
}

/**
 * Generate daily production data
 */
function generateDailyData(dailyProduction, days) {
  const dailyData = [];
  
  for (let day = 1; day <= days; day++) {
    // Add some variation (+/- 20%)
    const variation = 0.8 + Math.random() * 0.4;
    const production = dailyProduction * variation;
    
    dailyData.push({
      label: `Day ${day}`,
      value: Math.round(production * 100) / 100,
      timestamp: day
    });
  }
  
  return dailyData;
}

/**
 * Generate weekly production data
 */
function generateWeeklyData(dailyProduction, weeks) {
  const weeklyData = [];
  
  for (let week = 1; week <= weeks; week++) {
    const weeklyProduction = dailyProduction * 7;
    const variation = 0.85 + Math.random() * 0.3;
    
    weeklyData.push({
      label: `Week ${week}`,
      value: Math.round(weeklyProduction * variation * 100) / 100,
      timestamp: week
    });
  }
  
  return weeklyData;
}

/**
 * Generate monthly production data
 */
function generateMonthlyData(monthlyProduction) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Seasonal variation (summer months produce more)
  const seasonalFactors = [0.7, 0.75, 0.9, 1.0, 1.15, 1.25, 1.3, 1.25, 1.1, 0.95, 0.75, 0.7];
  
  return months.map((month, index) => ({
    label: month,
    value: Math.round(monthlyProduction * seasonalFactors[index] * 100) / 100,
    timestamp: index + 1
  }));
}

/**
 * Generate yearly production data
 */
function generateYearlyData(yearlyProduction) {
  const currentYear = new Date().getFullYear();
  const yearlyData = [];
  
  for (let i = 0; i < 25; i++) { // 25-year panel lifetime
    // Account for panel degradation (~0.5% per year)
    const degradationFactor = Math.pow(0.995, i);
    const production = yearlyProduction * degradationFactor;
    
    yearlyData.push({
      label: `${currentYear + i}`,
      value: Math.round(production * 100) / 100,
      timestamp: currentYear + i
    });
  }
  
  return yearlyData;
}

module.exports = {
  calculateEnergyProduction
};
