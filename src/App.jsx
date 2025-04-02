import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('');
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function getWeather() {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    
    const apiKey = '18d2d9e6fbfca85fc00904fef86000b1';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Ville non trouvée');
        }
        return response.json();
      })
      .then((data) => {
        const weather = {
          location: `${data.name}, ${data.sys.country}`,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          wind: data.wind.speed,
          condition: data.weather[0].description,
          icon: data.weather[0].icon
        };
        setWeatherInfo(weather);
        setLoading(false);
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

  return (
    <div className="app-container">
      <div className="weather-app">
        <h1 className="app-title">Météo en Direct</h1>
        
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Entrez une ville..." 
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          <button 
            onClick={getWeather} 
            className="search-button"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Rechercher'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {weatherInfo && !error && (
          <div className="weather-card">
            <div className="weather-header">
              <h2>{weatherInfo.location}</h2>
              {weatherInfo.icon && (
                <img 
                  src={`http://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`} 
                  alt={weatherInfo.condition}
                  className="weather-icon"
                />
              )}
            </div>
            
            <div className="temperature-container">
              <div className="main-temperature">
                {weatherInfo.temperature}°C
              </div>
              <div className="weather-condition">
                {weatherInfo.condition}
              </div>
            </div>
            
            <div className="weather-details">
              <div className="detail-item">
                <span className="detail-label">Ressenti:</span>
                <span className="detail-value">{weatherInfo.feelsLike}°C</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Humidité:</span>
                <span className="detail-value">{weatherInfo.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Vent:</span>
                <span className="detail-value">{weatherInfo.wind} km/h</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App