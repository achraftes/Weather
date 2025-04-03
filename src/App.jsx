import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('');
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);

  function getWeather() {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    
    const apiKey = '18d2d9e6fbfca85fc00904fef86000b1';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    
    // Get current weather
    fetch(weatherUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('City not found');
        }
        return response.json();
      })
      .then((data) => {
        const weather = {
          location: data.name,
          country: data.sys.country,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          wind: data.wind.speed,
          condition: data.weather[0].description,
          icon: data.weather[0].icon
        };
        setWeatherInfo(weather);
        
        // Now get forecast data
        return fetch(forecastUrl);
      })
      .then(response => response.json())
      .then(data => {
        // Process forecast data
        const dailyData = processDailyForecast(data.list);
        setForecastData(dailyData);
        
        // Process hourly data (next 24 hours)
        const hourlyData = processHourlyForecast(data.list.slice(0, 8));
        setHourlyForecast(hourlyData);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
        setLoading(false);
      });
  }

  // Process forecast data to get daily forecasts
  function processDailyForecast(forecastList) {
    const dailyMap = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!dailyMap[day] || date.getHours() === 12) {
        dailyMap[day] = {
          day: day,
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon,
          condition: item.weather[0].description
        };
      }
    });
    
    return Object.values(dailyMap).slice(0, 5);
  }
  
  // Process hourly forecast data
  function processHourlyForecast(hourlyList) {
    return hourlyList.map(item => {
      const date = new Date(item.dt * 1000);
      return {
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon
      };
    });
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      getWeather();
    }
  }

  function formatCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="app-container">
      <div className="unified-weather-app">
        {/* Header with search */}
        <div className="app-header">
          <h1>Weather Dashboard</h1>
          <div className="search-area">
            <div className="search-box">
              <input
                type="text"
                placeholder="Enter city name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button onClick={getWeather} disabled={loading}>
                {loading ? 
                  <span className="loading-spinner"></span> : 
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                }
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        {/* Weather content */}
        {weatherInfo && (
          <div className="weather-content">
            {/* Current weather section */}
            <div className="current-weather">
              <div className="location-info">
                <h2>{weatherInfo.location}, {weatherInfo.country}</h2>
                <p className="current-time">{formatCurrentTime()}</p>
                <div className="current-condition">{weatherInfo.condition}</div>
              </div>
              <div className="temp-display">
                <div className="temp-icon">
                  <img src={`https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`} alt="Weather" />
                </div>
                <div className="temp-value">{weatherInfo.temperature}°C</div>
              </div>
            </div>

            {/* Weather details section */}
            <div className="weather-details-section">
              <h3>Weather Details</h3>
              <div className="weather-details">
                <div className="detail-card">
                  <div className="detail-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 18c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zm1-13h-2v6h6v-2h-4V7z"/>
                    </svg>
                  </div>
                  <div className="detail-info">
                    <div className="detail-label">Feels Like</div>
                    <div className="detail-value">{weatherInfo.feelsLike}°C</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 18c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8zm-1-8c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z"/>
                    </svg>
                  </div>
                  <div className="detail-info">
                    <div className="detail-label">Humidity</div>
                    <div className="detail-value">{weatherInfo.humidity}%</div>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M13 5.83l1.88 1.88-1.6 1.6 1.41 1.41 3.02-3.02L12 2h-1v5.03l2 2v-3.2zM5.41 4L4 5.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l4.29-4.29 2.3 2.29L20 18.59 5.41 4zM13 18.17v-3.76l1.88 1.88L13 18.17z"/>
                    </svg>
                  </div>
                  <div className="detail-info">
                    <div className="detail-label">Wind</div>
                    <div className="detail-value">{weatherInfo.wind} m/s</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly forecast section */}
            {hourlyForecast.length > 0 && (
              <div className="forecast-section">
                <h3>Today's Forecast</h3>
                <div className="hourly-forecast">
                  {hourlyForecast.map((hour, index) => (
                    <div className="hourly-item" key={index}>
                      <div className="hour">{hour.time}</div>
                      <div className="weather-icon">
                        <img src={`https://openweathermap.org/img/wn/${hour.icon}.png`} alt="Weather" />
                      </div>
                      <div className="temp">{hour.temp}°</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5-day forecast section */}
            {forecastData.length > 0 && (
              <div className="forecast-section">
                <h3>{forecastData.length}-Day Forecast</h3>
                <div className="days-forecast">
                  {forecastData.map((day, index) => (
                    <div className="day-item" key={index}>
                      <div className="day-name">{day.day}</div>
                      <div className="weather-icon">
                        <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt="Weather" />
                      </div>
                      <div className="condition">{day.condition}</div>
                      <div className="temp">{day.temp}°</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!weatherInfo && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" width="64" height="64">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v7h-2zm0 9h2v2h-2z"/>
              </svg>
            </div>
            <h2>Search for a city to get started</h2>
            <p>Enter a city name above to view current weather and forecast</p>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner large"></div>
            <p>Loading weather data...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App