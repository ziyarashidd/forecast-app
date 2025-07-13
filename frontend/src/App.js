import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Card,
  Grid,
  Paper,
  Divider,
  Link,
  Grow,
  Fade,
} from "@mui/material";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";

import {
  WiHumidity,
  WiThermometer,
  WiStrongWind,
  WiCloud,
  WiDaySunny,
  WiRain,
} from "react-icons/wi";

// Fix default icon issue with React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const API_BASE_URL = "https://forecast-app-3a69.onrender.com/";

export default function HomePage() {
  const [city, setCity] = useState("");
  const [aqiData, setAqiData] = useState(null);
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAQIByCity = async () => {
    if (!city.trim()) return setError("Please enter a city name");
    setLoading(true);
    setError("");
    setAqiData(null);
    setCoords(null);
    setWeather(null);

    try {
      const res = await fetch(`${API_BASE_URL}?city=${encodeURIComponent(city)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch AQI data");
      }

      const data = await res.json();

      if (!data.aqi || !data.weather || !data.coord) {
        throw new Error("Incomplete data received");
      }

      setAqiData(data.aqi);
      setCoords(data.coord);
      setWeather(data.weather);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAQIDescription = (level) => {
    const levels = {
      1: "Good",
      2: "Fair",
      3: "Moderate",
      4: "Poor",
      5: "Very Poor",
    };
    return levels[level] || "Unknown";
  };

  // AQI Colors for better UX
  const aqiColors = {
    1: "#4caf50",
    2: "#ffeb3b",
    3: "#ff9800",
    4: "#f44336",
    5: "#9c27b0",
  };

  // Choose weather icon based on description (basic)
  const getWeatherIcon = (desc) => {
    desc = desc.toLowerCase();
    if (desc.includes("sun") || desc.includes("clear"))
      return <WiDaySunny size={36} color="#fdd835" />;
    if (desc.includes("cloud"))
      return <WiCloud size={36} color="#90a4ae" />;
    if (desc.includes("rain"))
      return <WiRain size={36} color="#2196f3" />;
    return <WiCloud size={36} color="#90a4ae" />;
  };

  return (
    <>
      {/* Hero Section with animated floating bubbles */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 360, sm: 420 },
          background: "linear-gradient(135deg, #1976d2 30%, #42a5f5 90%)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
          px: 3,
          mb: 6,
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          borderRadius: 0,
        }}
      >
        <Box className="bubbles" />
        <Grow in timeout={1200}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{
              textShadow: "2px 2px 6px rgba(0,0,0,0.5)",
              fontSize: { xs: "1.8rem", sm: "2.75rem" },
            }}
          >
            🌍 Check Air Quality & Weather
          </Typography>
        </Grow>
        <Grow in timeout={1500}>
          <Typography
            variant="body1"
            sx={{
              maxWidth: 600,
              mb: 3,
              opacity: 0.9,
              fontWeight: 500,
              fontSize: { xs: "0.9rem", sm: "1.1rem" },
            }}
          >
            Get real-time air pollution and weather information for any city around the world.
          </Typography>
        </Grow>

        <Grow in timeout={1800}>
          <Box
            sx={{
              width: { xs: "100%", sm: 480 },
              display: "flex",
              gap: 2,
              mt: 1,
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextField
              variant="outlined"
              size="large"
              placeholder="Enter city name"
              fullWidth
              sx={{
                backgroundColor: "#fff",
                borderRadius: 3,
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  fontWeight: 500,
                  fontSize: { xs: "1.1rem", sm: "1.2rem" },
                  paddingRight: 0,
                  "& fieldset": {
                    borderColor: "#1976d2",
                  },
                  "&:hover fieldset": {
                    borderColor: "#1565c0",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#0d47a1",
                    borderWidth: 2,
                  },
                },
                input: {
                  padding: "14px 16px",
                  fontWeight: 600,
                },
              }}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchAQIByCity()}
              autoFocus
            />
            <Button
              variant="contained"
              size="large"
              onClick={fetchAQIByCity}
              sx={{
                borderRadius: 3,
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.1rem" },
                px: { xs: 4, sm: 5 },
                background: "linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)",
                boxShadow: "0 4px 15px rgba(33, 203, 243, 0.5)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(45deg, #1976d2 30%, #1e88e5 90%)",
                  boxShadow: "0 6px 20px rgba(25, 118, 210, 0.7)",
                  transform: "scale(1.05)",
                },
              }}
            >
              Search
            </Button>
          </Box>
        </Grow>
      </Box>

      {/* Main Container */}
      <Container maxWidth="md" sx={{ mb: 8, px: { xs: 2, sm: 3 } }}>
        {/* Loading and Error */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
            <CircularProgress size={50} thickness={5} />
          </Box>
        )}

        {error && (
          <Fade in={true}>
            <Alert severity="error" sx={{ mb: 4, fontWeight: "medium" }}>
              {error}
            </Alert>
          </Fade>
        )}

        {/* AQI & Weather Results */}
        {aqiData && (
          <Fade in={true} timeout={700}>
            <Card
              elevation={8}
              sx={{
                mb: 5,
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                p: { xs: 2, sm: 3 },
                backgroundColor: "#fafafa",
                cursor: "default",
                "&:hover": {
                  boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
                  transform: "scale(1.02)",
                  transition: "all 0.3s ease",
                },
                overflowX: "auto",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                color={aqiColors[aqiData.main.aqi]}
                sx={{ mb: 1, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
              >
                📍 {city.trim()} — AQI Level: {aqiData.main.aqi} —{" "}
                {getAQIDescription(aqiData.main.aqi)}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                sx={{ mb: 3, display: "block" }}
              >
                Last updated: {new Date(aqiData.dt * 1000).toLocaleString()}
              </Typography>

              <Grid container spacing={2}>
                {[
                  {
                    label: "PM2.5 (Fine Particles)",
                    value: aqiData.components.pm2_5,
                    color: "#e53935",
                  },
                  {
                    label: "PM10 (Coarse Dust)",
                    value: aqiData.components.pm10,
                    color: "#fb8c00",
                  },
                  {
                    label: "NO₂ (Nitrogen Dioxide)",
                    value: aqiData.components.no2,
                    color: "#8e24aa",
                  },
                  {
                    label: "SO₂ (Sulfur Dioxide)",
                    value: aqiData.components.so2,
                    color: "#607d8b",
                  },
                  {
                    label: "CO (Carbon Monoxide)",
                    value: aqiData.components.co,
                    color: "#3949ab",
                  },
                  {
                    label: "O₃ (Ozone)",
                    value: aqiData.components.o3,
                    color: "#43a047",
                  },
                ].map(({ label, value, color }) => (
                  <Grid item xs={12} sm={6} key={label}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 1.5,
                        textAlign: "center",
                        borderLeft: `6px solid ${color}`,
                        backgroundColor: "white",
                        fontWeight: "medium",
                        transition: "transform 0.15s ease-in-out",
                        "&:hover": { transform: "scale(1.07)" },
                        userSelect: "none",
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {label}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color={color}
                        sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                      >
                        {value} µg/m³
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Map */}
              {coords && (
                <Box sx={{ mt: 4, borderRadius: 3, overflow: "hidden" }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    color="#0288d1"
                    sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                  >
                    📍 Location Map
                  </Typography>
                  <MapContainer
                    center={[coords.lat, coords.lon]}
                    zoom={10}
                    scrollWheelZoom={false}
                    style={{
                      height: 250,
                      width: "100%",
                      borderRadius: 12,
                      minWidth: 280,
                    }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[coords.lat, coords.lon]}>
                      <Popup>{city.trim()}</Popup>
                    </Marker>
                  </MapContainer>
                </Box>
              )}
            </Card>
          </Fade>
        )}

        {weather && (
          <Fade in={true} timeout={800}>
            <Card
              elevation={8}
              sx={{
                borderRadius: 3,
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                p: { xs: 2, sm: 3 },
                backgroundColor: "#fafafa",
                mb: 6,
                cursor: "default",
                "&:hover": {
                  boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
                  transform: "scale(1.02)",
                  transition: "all 0.3s ease",
                },
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                color="#0288d1"
                sx={{ mb: 3, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
                🌤 Weather Details
              </Typography>

              <Grid container spacing={2}>
                {[
                  {
                    label: "Temperature",
                    icon: <WiThermometer size={40} color="#f44336" />,
                    value: `${weather.temp} °C`,
                    color: "#f44336",
                  },
                  {
                    label: "Humidity",
                    icon: <WiHumidity size={40} color="#2196f3" />,
                    value: `${weather.humidity}%`,
                    color: "#2196f3",
                  },
                  {
                    label: "Wind Speed",
                    icon: <WiStrongWind size={40} color="#4caf50" />,
                    value: `${weather.wind_speed} m/s`,
                    color: "#4caf50",
                  },
                  {
                    label: "Conditions",
                    icon: getWeatherIcon(weather.description),
                    value: weather.description,
                    color: "#90a4ae",
                  },
                ].map(({ label, icon, value, color }) => (
                  <Grid item xs={12} sm={6} key={label}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        borderLeft: `6px solid ${color}`,
                        fontWeight: "medium",
                        backgroundColor: "white",
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        userSelect: "none",
                        cursor: "default",
                        "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.12)" },
                      }}
                    >
                      {icon}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {label}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" sx={{ mt: 0.3 }}>
                          {value}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Fade>
        )}

        {/* Footer */}
        <Box
          sx={{
            textAlign: "center",
            color: "text.secondary",
            fontWeight: 500,
            fontSize: "0.875rem",
            mt: 21,
            mb: 3,
          }}
        >
          Developed with ❤️ by Md Ziya Rashid —{" "}
          <Link href="https://github.com/ziyarashidd" target="_blank" rel="noopener" underline="hover">
            GitHub
          </Link>
        </Box>
      </Container>
    </>
  );
}
