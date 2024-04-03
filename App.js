import React, { useState, useEffect } from "react";
import { API_KEY } from "@env";

import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";

import * as Location from "expo-location";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const apikey = API_KEY;

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};

export default function App() {
  const [city, setCity] = useState("Loadding...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const getWeather = async () => {
    // user의 위치 취득
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync(
      {
        latitude,
        longitude,
      },
      { useGoogleMaps: false }
    );
    setCity(location[0].city);
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apikey}&units=metric`
    );
    const json = await res.json();
    setDays(
      json.list.filter((weather) => {
        if (weather.dt_txt.includes("00:00:00")) {
          return weather;
        }
      })
    );
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              color="white"
              style={{ marginTop: 10 }}
              size="large"
            />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View style={styles.city}>
                <Text style={styles.cityName}>{city}</Text>
              </View>
              <View style={styles.weatherIconAndTemp}>
                <Text style={[styles.temp, { zIndex: 1 }]}>
                  {parseFloat(day.main.temp).toFixed(1)}
                </Text>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={200}
                  color="white"
                  style={{ position: "absolute", zIndex: 0, opacity: 0.5 }}
                />
              </View>
              <Text style={styles.des}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
              <Text style={styles.date}>
                {new Date(day.dt * 1000).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "orange",
    flex: 1,
  },
  city: {
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 40,
    fontWeight: "500",
  },
  weatherIconAndTemp: {
    justifyContent: "center",
    alignItems: "center",
  },
  day: {
    justifyContent: "center",
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  temp: {
    fontSize: 150,
  },
  des: {
    fontSize: 50,
    marginTop: -30,
  },
  tinyText: {
    fontSize: 20,
  },
});
