const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENWEATHER_API_KEY;

// Rate Limiter - max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests from this IP, please try again later" },
});
app.use('/api/', limiter);

// Cache with 5 minutes TTL
const cache = new NodeCache({ stdTTL: 300 });

app.get('/api/airquality', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "City parameter is required" });
  }

  const cityKey = city.toLowerCase();

  // Check cache
  const cachedData = cache.get(cityKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    // Get coordinates for city
    const geoRes = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
    );

    if (!geoRes.data.length) {
      return res.status(404).json({ error: "City not found" });
    }

    const { lat, lon } = geoRes.data[0];

    // Fetch AQI data
    const aqiRes = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );

    if (!aqiRes.data.list || !aqiRes.data.list.length) {
      return res.status(500).json({ error: "Failed to get AQI data" });
    }

    // Fetch weather data
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!weatherRes.data) {
      return res.status(500).json({ error: "Failed to get weather data" });
    }

    const responseData = {
      coord: { lat, lon },
      aqi: aqiRes.data.list[0],
      weather: {
        temp: weatherRes.data.main.temp,
        humidity: weatherRes.data.main.humidity,
        wind: weatherRes.data.wind.speed,
        description: weatherRes.data.weather[0].description,
      },
    };

    // Cache the response
    cache.set(cityKey, responseData);

    res.json(responseData);

  } catch (err) {
    console.error("Backend error:", err.message);
    res.status(500).json({ error: "Failed to fetch AQI/Weather data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
