import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('');
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('main'); // 'main', 'current', 'forecast'

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
        setView('current');
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

  // Simple forecast data (normally would come from API)
  const forecastData = [
    { day: 'Mon', temp: 28, icon: '01d' },
    { day: 'Tue', temp: 30, icon: '01d' },
    { day: 'Wed', temp: 29, icon: '02d' },
    { day: 'Thu', temp: 27, icon: '10d' },
    { day: 'Fri', temp: 26, icon: '01d' }
  ];

  const weekForecast = [
    { day: 'Tomorrow', temp: 30, condition: 'Sunny' },
    { day: 'Thursday', temp: 28, condition: 'Partly cloudy' },
    { day: 'Friday', temp: 26, condition: 'Rainy' }
  ];

  const renderMainView = () => (
    <div className="welcome-view">
      <div className="logo-container">
        <div className="weather-logo">
          <img src="https://openweathermap.org/img/wn/02d@2x.png" alt="Weather" />
        </div>
      </div>
      <h1>Weather<br/>Forecast App</h1>
      <p>Get real-time weather updates for any location</p>
      <button className="get-started-btn" onClick={() => setView('search')}>
        Get Started
      </button>
    </div>
  );

  const renderSearchView = () => (
    <div className="search-view">
      <div className="back-button" onClick={() => setView('main')}>
        &larr;
      </div>
      <h2>Search Location</h2>
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

  const renderCurrentView = () => (
    <div className="current-view">
      <div className="view-header">
        <div className="back-button" onClick={() => setView('search')}>
          &larr;
        </div>
        <h2>{weatherInfo.location}</h2>
        <div className="more-menu" onClick={() => setView('forecast')}>
          &rarr;
        </div>
      </div>

      <div className="current-weather">
        <div className="current-icon">
          <img 
            src={`http://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`}
            alt={weatherInfo.condition}
          />
        </div>
        <div className="current-temp">{weatherInfo.temperature}°</div>
        <div className="current-condition">{weatherInfo.condition}</div>
      </div>

      <div className="forecast-strip">
        {forecastData.map((day, index) => (
          <div className="forecast-day" key={index}>
            <div className="day-name">{day.day}</div>
            <div className="day-icon">
              <img 
                src={`http://openweathermap.org/img/wn/${day.icon}.png`}
                alt="Weather"
              />
            </div>
            <div className="day-temp">{day.temp}°</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderForecastView = () => (
    <div className="forecast-view">
      <div className="view-header">
        <div className="back-button" onClick={() => setView('current')}>
          &larr;
        </div>
        <h2>Weekly forecast</h2>
      </div>

      <div className="current-location">{weatherInfo.location}</div>
      
      <div className="week-forecast">
        {weekForecast.map((day, index) => (
          <div className="week-day" key={index}>
            <div className="week-day-name">{day.day}</div>
            <div className="week-day-info">
              <div className="week-day-condition">{day.condition}</div>
              <div className="week-day-temp">{day.temp}°</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  let content;
  switch(view) {
    case 'main':
      content = renderMainView();
      break;
    case 'search':
      content = renderSearchView();
      break;
    case 'current':
      content = weatherInfo ? renderCurrentView() : renderSearchView();
      break;
    case 'forecast':
      content = weatherInfo ? renderForecastView() : renderSearchView();
      break;
    default:
      content = renderMainView();
  }

  return (
    <div className="app-container">
      {content}
    </div>
  );
}

export default App