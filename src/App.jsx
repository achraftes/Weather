
import { useState } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('');
  const [weatherinfo, setWeatherinfo] = useState(null);
  function getWeather() {
    const apiKey = '18d2d9e6fbfca85fc00904fef86000b1';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        let MT = Math.round(data.main.temp);
        let FL = Math.round(data.main.fells_like);
        const weather = {

          location: `Weather in ${data.name}`,
          temperature: `Temperature: ${MT} C`,
          feelslike: `Feels Like: ${FL} C`,
          humidity: `Humidity: ${data.main.humidity}%`,
          wind: `Wind: ${data.wind.speed} km/h`,
          condition: `Weather Condition: ${data.weather[0].description}`
        };
        setWeatherinfo(weather);
      })
      .catch((error) => {
        console.error(error);

      });
  }
  return (
    <div className='weather-container'>
      <input type="text" placeholder='Search' value={city} onChange={(e) => setCity(e.target.value)} />
      <button onClick={getWeather}>Get Weather</button>
      {weatherinfo && (
        <div className='weather-info'>
          <h3>{weatherinfo.location}</h3>
          <p>{weatherinfo.temperature}</p>
          <p>{weatherinfo.feelslike}</p>
          <p>{weatherinfo.humidity}</p>
          <p>{weatherinfo.wind}</p>
          <p>{weatherinfo.condition}</p>
        </div>
      )

      }

    </div>


  )
}

export default App
