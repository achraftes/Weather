import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('');
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('main'); // 'main', 'dashboard'

  function getWeather() {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    
    const apiKey = '18d2d9e6fbfca85fc00904fef86000b1';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    fetch(url)
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
        setLoading(false);
        setView('dashboard');
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
        setLoading(false);
      });
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      getWeather();
    }
  }

  // Mock recent searches data
  const recentSearches = [
    { city: 'Madrid', temp: 31, time: '10:25', icon: '01d' },
    { city: 'Malaga', temp: 33, time: '10:30', icon: '02d' },
    { city: 'Malachy', temp: 22, time: '10:42', icon: '11d' }
  ];

  // Mock hourly forecast data
  const hourlyForecast = [
    { time: '9:00 AM', temp: 25, icon: '02d' },
    { time: '12:00 PM', temp: 28, icon: '01d' },
    { time: '3:00 PM', temp: 33, icon: '02d' }
  ];

  // Mock 5-day forecast data
  const daysForecast = [
    { day: 'Today', condition: 'Sunny', temp: 33, icon: '01d' },
    { day: 'Tue', condition: 'Sunny', temp: 31, icon: '01d' },
    { day: 'Wed', condition: 'Sunny', temp: 27, icon: '01d' }
  ];

  // Mock favorite cities
  const suggestions = [
    { city: 'Madrid', temp: 31, icon: '01d' },
    { city: 'Malaga', temp: 33, icon: '02d' }
  ];

  const renderSideNav = () => (
    <div className="side-nav">
      <div className="nav-item active">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M12 2a9 9 0 0 1 9 9c0 4.2-2.8 7.7-6.7 8.8L14 19l-6.7.7C3.4 18.8 1 15 1 11a9 9 0 0 1 9-9zm0 2c-3.9 0-7 3.1-7 7 0 3 1.9 5.6 4.5 6.6l4.5-.5-.5-4.5c2.9-1 5-3.5 5-6.6 0-3.9-3.1-7-7-7z" fill="currentColor"/>
        </svg>
      </div>
      <div className="nav-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M17 6H7c-3.3 0-6 2.7-6 6s2.7 6 6 6h10c3.3 0 6-2.7 6-6s-2.7-6-6-6zm0 10H7c-2.2 0-4-1.8-4-4s1.8-4 4-4h10c2.2 0 4 1.8 4 4s-1.8 4-4 4z" fill="currentColor"/>
          <circle cx="17" cy="12" r="2" fill="currentColor"/>
        </svg>
      </div>
      <div className="nav-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm0-2c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" fill="currentColor"/>
        </svg>
      </div>
      <div className="nav-item">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M19.9 12.66a7.99 7.99 0 0 1-7.9 6.34c-4.42 0-8-3.58-8-8 0-3.54 2.29-6.53 5.47-7.59.4 2.01 2.16 3.53 4.28 3.59 2.09.06 3.85-1.36 4.35-3.31 2.33.69 4.19 2.48 4.98 4.77" fill="currentColor"/>
        </svg>
      </div>
      <div className="nav-item settings">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z"/>
          <path d="M9.17 20H4v-8.5l7-7 8.5 8.5-7 7h-3.33zM4 20h16v2H4v-2zm13.9-7.1L12 7l-6.1 6.1L12 19.2l5.9-6.3z" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="dashboard">
      {renderSideNav()}
      
      <div className="main-content">
        <div className="section-header">
          <h2>LATEST SEARCHES</h2>
        </div>
        
        <div className="recent-searches">
          {recentSearches.map((item, index) => (
            <div className="search-card" key={index}>
              <div className="card-location">
                <div className="weather-icon">
                  <img src={`https://openweathermap.org/img/wn/${item.icon}.png`} alt="Weather" />
                </div>
                <div className="location-name">{item.city}</div>
                <div className="time">{item.time}</div>
              </div>
              <div className="temperature">{item.temp}°</div>
            </div>
          ))}
        </div>
        
        <div className="section-header">
          <h2>MORE SUGGESTIONS</h2>
        </div>
        
        <div className="suggestions">
          {suggestions.map((item, index) => (
            <div className="suggestion-card" key={index}>
              <div className="suggestion-location">{item.city}</div>
              <div className="weather-icon">
                <img src={`https://openweathermap.org/img/wn/${item.icon}.png`} alt="Weather" />
              </div>
              <div className="temperature">{item.temp}°</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="detail-panel">
        <div className="current-weather-header">
          <div>
            <h2 className="city-name">Malaga</h2>
            <div className="current-time">10:30 AM</div>
          </div>
          <div className="current-temperature">
            <span className="temp-value">33</span>°
          </div>
          <div className="current-icon">
            <img src="https://openweathermap.org/img/wn/02d@2x.png" alt="Weather" />
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
          <h3>3 DAY FORECAST</h3>
          <div className="days-forecast">
            {daysForecast.map((day, index) => (
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

  const renderMainView = () => (
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

  return (
    <div className="app-container">
      {view === 'main' ? renderMainView() : renderDashboard()}
    </div>
  );
}

export default App