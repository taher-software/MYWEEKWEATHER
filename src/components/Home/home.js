import { React, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import XMLHttpRequest from 'xhr2';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { setCountry } from '../../Redux/Position/Action/action';
import Header from './header';
import getWeatherData from '../../Redux/Weather/Thunk/thunk';
import { weatherDescription, currentData } from './weatherHandler';
import WeakWEather from './weekWeather';

const Home = () => {
  const [coord, setCoord] = useState([0, 0]);
  const dispatch = useDispatch();
  const weather = useSelector((state) => state.weather);
  const location = useSelector((state) => state.city);
  const toggle = useSelector((state) => state.toggle);
  const [
    currentDescription,
    currentWind,
    currentHumidity,
    currentPressure,
    currentTemp,
  ] = currentData(weather);
  const [
    currentWeatherDescription,
    currentImage,
  ] = weatherDescription[currentDescription.toLowerCase()];
  const getCity = (coordinates) => {
    const xhr = new XMLHttpRequest();
    const lat = coordinates[0];
    const lng = coordinates[1];
    function processRequest() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        const loc = response.address;
        dispatch(setCountry(loc));
      }
    }
    xhr.open('GET', `https://us1.locationiq.com/v1/reverse.php?key=pk.f19e4fdca419f2e8ffa20180b18d27d6&lat=${
      lat}&lon=${lng}&format=json`, true);
    xhr.send();
    xhr.onreadystatechange = processRequest;
    xhr.addEventListener('readystatechange', processRequest, false);
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = [position.coords.latitude.toString(), position.coords.longitude.toString()];
      getCity(coords);
      setCoord([position.coords.latitude, position.coords.longitude]);
    });
  };

  const weatherAnimation = () => {
    const element = document.querySelector('.weather');
    const translate = (ds) => {
      element.style.transform += `translate(${ds}px)`;
    };
    const rotate = () => {
      element.style.transform += 'rotate(1deg)';
    };
    if (currentWeatherDescription) {
      if (currentWeatherDescription === 'SUNNY') {
        rotate();
      } else {
        setTimeout(translate, 1000, 3);
        setTimeout(translate, 2000, 3);
        setTimeout(translate, 3000, -3);
        setTimeout(translate, 4000, -3);
      }
    }
  };

  const searchLatAndLngByStreet = async (location) => {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=59fbb7ff74d34f8486c9a37271339b21`;
    const result = await fetch(url);
    const res = await result.json();
    const pertinentResult = res.results[0];
    const { lat, lng } = pertinentResult.geometry;
    setCoord([lat, lng]);
  };
  useEffect(() => getCurrentLocation(), []);
  useEffect(() => {
    let weatherManagment;
    if (currentWeatherDescription === 'SUNNY') {
      document.querySelector('.weather').style.transform = 'translate(0px)';
      weatherManagment = setInterval(weatherAnimation, 1);
    } else {
      document.querySelector('.weather').style.transform = 'rotate(0deg)';
      weatherManagment = setInterval(weatherAnimation, 4000);
    }
    return () => clearInterval(weatherManagment);
  }, [weather]);
  useEffect(() => dispatch(getWeatherData(coord[0], coord[1])), [coord]);
  useEffect(() => searchLatAndLngByStreet(location.country), [toggle]);
  return (
    <div>
      <Header getCurrentLocation={getCurrentLocation} />
      <Grid
        container
        style={{
          margin: '50px 5% 100px 5%', backgroundColor: 'rgb(42, 84, 108)', padding: '25px 0', width: '90%', border: '4px solid rgb(96, 128, 148)', borderRadius: '5%',
        }}
      >
        <Grid
          item
          xs={6}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
          }}
        >
          <img src={currentImage} alt="weather" style={{ marginBottom: '20px', width: '60px' }} className="weather" />
          <Typography variant="h5" style={{ color: '#fff' }}>{currentWeatherDescription}</Typography>
        </Grid>
        <Grid item xs={5} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <Typography variant="span" style={{ color: '#fff' }}>
            {`Wind: ${currentWind} m/s`}
          </Typography>
          <Typography variant="span" style={{ color: '#fff' }}>
            {`Humidity: ${currentHumidity} %`}
          </Typography>
          <Typography variant="span" style={{ color: '#fff' }}>
            {`Pressure: ${currentPressure} hPa`}
          </Typography>
          <Typography variant="h6" style={{ color: '#fff', textAlign: 'center' }}>
            {`${currentTemp}°c`}
          </Typography>
        </Grid>
      </Grid>
      <WeakWEather />
    </div>
  );
};
export default Home;
