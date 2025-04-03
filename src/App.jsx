import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('');
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('search'); // 'search' or 'dashboard'
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
        setView('dashboard');
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

  function renderSideNav() {
    return (
      <div className="side-nav">
        <div className="nav-item active">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
          </svg>
        </div>
        <div className="nav-item">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v8h-2zm0 10h2v2h-2z"/>
          </svg>
        </div>
        <div className="nav-item settings">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
          </svg>
        </div>
      </div>
    );
  }

  function renderDashboard() {
    if (!weatherInfo) return null;
    
    return (
      <div className="dashboard">
        {renderSideNav()}
        
        <div className="main-content">
          <div className="section-header">
            <h2>LATEST SEARCHES</h2>
          </div>
          
          <div className="recent-searches">
            <div className="search-card">
              <div className="card-location">
                <div className="weather-icon">
                  <img src={`https://openweathermap.org/img/wn/${weatherInfo.icon}.png`} alt="Weather" />
                </div>
                <div className="location-name">{weatherInfo.location}</div>
                <div className="time">{formatCurrentTime()}</div>
              </div>
              <div className="temperature">{weatherInfo.temperature}°</div>
            </div>
          </div>
          
          <div className="section-header">
            <h2>WEATHER DETAILS</h2>
          </div>
          
          <div className="weather-details">
            <div className="detail-card">
              <div className="detail-label">Humidity</div>
              <div className="detail-value">{weatherInfo.humidity}%</div>
            </div>
            <div className="detail-card">
              <div className="detail-label">Wind</div>
              <div className="detail-value">{weatherInfo.wind} m/s</div>
            </div>
            <div className="detail-card">
              <div className="detail-label">Feels Like</div>
              <div className="detail-value">{weatherInfo.feelsLike}°</div>
            </div>
          </div>
          
          <div className="search-again">
            <button onClick={() => setView('search')}>Search Another City</button>
          </div>
        </div>
        
        <div className="detail-panel">
          <div className="current-weather-header">
            <div>
              <h2 className="city-name">{weatherInfo.location}</h2>
              <div className="current-time">{formatCurrentTime()}</div>
            </div>
            <div className="current-temperature">
              <span className="temp-value">{weatherInfo.temperature}</span>°
            </div>
            <div className="current-icon">
              <img src={`https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`} alt="Weather" />
            </div>
          </div>
          
          <div className="forecast-section">
            <h3>TODAY'S FORECAST</h3>
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
          
          <div className="forecast-section">
            <h3>{forecastData.length} DAY FORECAST</h3>
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
        </div>
      </div>
    );
  }

  function renderSearchView() {
    return (
      <div className="search-container">
        <h1>Weather Dashboard</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={getWeather} disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  }

  return (
    <div className="app-container">
      {view === 'search' ? renderSearchView() : renderDashboard()}
    </div>
  );
}

export default App