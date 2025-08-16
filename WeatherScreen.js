import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getWeatherByCity } from './weatherApi';

export default function WeatherScreen() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError('');
    try {
      const data = await getWeatherByCity(city);
      setWeather(data);
    } catch (err) {
      setError('City not found or error fetching data.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather App</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
        onSubmitEditing={searchWeather}
        returnKeyType="search"
      />

      {loading && <ActivityIndicator size="large" color="#000" />}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {weather && (
        <ScrollView style={styles.result}>
          <Text style={styles.city}>{weather.name}</Text>
          <Text style={styles.temp}>{weather.main.temp}°C</Text>
          <Text style={styles.details}>Humidity: {weather.main.humidity}%</Text>
          <Text style={styles.details}>Weather: {weather.weather[0].description}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f8ff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 20 },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 },
  result: { marginTop: 20 },
  city: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  temp: { fontSize: 28, textAlign: 'center' },
  details: { fontSize: 18, textAlign: 'center', marginTop: 5 },
});
