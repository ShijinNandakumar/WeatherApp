import axios from 'axios';

const API_KEY = 'e1a0bcb53886e88c5b15bd929d6f6c5d'; // 🔁 Replace with your real key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeatherByCity = async (city) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
