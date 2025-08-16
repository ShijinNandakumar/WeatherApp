import React, { useState, useEffect, useRef } from 'react';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = 'e1a0bcb53886e88c5b15bd929d6f6c5d'; // Replace with your OpenWeatherMap API key

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const typingTimeoutRef = useRef(null);
  
  // Load saved city on app start
  useEffect(() => {
    const loadCity = async () => {
      try {
        const savedCity = await AsyncStorage.getItem('lastCity');
        if (savedCity) {
          setCity(savedCity);
          fetchWeather(savedCity);
        }
      } catch (e) {
        console.error('Failed to load city from storage');
      }
    };
    loadCity();
  }, []);

  // Fetch current weather and forecast for a city
  const fetchWeather = async (cityName) => {
    if (!cityName) return;

    Keyboard.dismiss();
    setSuggestions([]);
    setLoading(true);
    try {
      // Current weather
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();

      if (data.cod !== 200) {
        alert('City not found or error fetching data');
        setWeather(null);
        setForecast([]);
        setLoading(false);
        return;
      }
      setWeather(data);
      await AsyncStorage.setItem('lastCity', cityName);

      // 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();

      // Get only one forecast per day at 12:00:00
      const daily = forecastData.list.filter((item) =>
        item.dt_txt.includes('12:00:00')
      );
      setForecast(daily);
    } catch (error) {
      alert('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch city suggestions using OpenWeatherMap Geocoding API
  const fetchSuggestions = async (text) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Debounce: wait 500ms after user stops typing
    typingTimeoutRef.current = setTimeout(async () => {
      if (!text) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `http://api.openweathermap.org/geo/1.0/direct?q=${text}&limit=5&appid=${API_KEY}`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        setSuggestions([]);
      }
    }, 500);
  };

  // Render each suggestion as a clickable item
  const renderSuggestion = (item, index) => {
    const displayName = `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          setCity(displayName);
          setSuggestions([]);
          fetchWeather(displayName);
        }}
        style={styles.suggestionItem}
      >
        <Text>{displayName}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather App 🌤️</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter city"
        value={city}
        onChangeText={(text) => {
          setCity(text);
          fetchSuggestions(text);
        }}
        returnKeyType="search"
        onSubmitEditing={() => fetchWeather(city)}
      />

      {suggestions.length > 0 && (
        <ScrollView style={styles.suggestionsContainer} keyboardShouldPersistTaps="handled">
          {suggestions.map(renderSuggestion)}
        </ScrollView>
      )}

      <Button title="Get Weather" onPress={() => fetchWeather(city)} />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}

      {weather && (
        <View style={styles.weatherBox}>
          <Text style={styles.city}>{weather.name}</Text>

          <Image
            style={styles.weatherIcon}
            source={{
              uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`,
            }}
          />

          <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
          <Text style={styles.details}>Humidity: {weather.main.humidity}%</Text>
          <Text style={styles.details}>{weather.weather[0].description}</Text>
        </View>
      )}

      {forecast.length > 0 && (
        <>
          <Text style={styles.forecastTitle}>5-Day Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
            {forecast.map((item, index) => (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.forecastDate}>{new Date(item.dt_txt).toLocaleDateString()}</Text>

                <Image
                  style={styles.forecastIcon}
                  source={{
                    uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                  }}
                />

                <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
                <Text style={styles.forecastDesc}>{item.weather[0].main}</Text>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#d0ebff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 0,
    backgroundColor: '#fff',
  },
  suggestionsContainer: {
    maxHeight: 120,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopWidth: 0,
    marginBottom: 15,
    borderRadius: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  weatherBox: {
    backgroundColor: '#ffffffdd',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  city: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  weatherIcon: {
    width: 150,
    height: 150,
  },
  temp: {
    fontSize: 48,
    marginVertical: 10,
  },
  details: {
    fontSize: 18,
    textTransform: 'capitalize',
  },
  forecastTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  forecastScroll: {
    flexDirection: 'row',
  },
  forecastItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    alignItems: 'center',
    width: 120,
  },
  forecastDate: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  forecastIcon: {
    width: 60,
    height: 60,
  },
  forecastTemp: {
    fontSize: 20,
    marginTop: 6,
  },
  forecastDesc: {
    fontSize: 16,
    textTransform: 'capitalize',
    marginTop: 4,
  },
});
