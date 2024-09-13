"use client";

import { useState, useEffect } from 'react'

interface WeatherData {
  weather: {
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
  dt: number;
}

const apiURL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(apiURL!)
      .then(response => response.json())
      .then(data => {
        setWeatherData(data.response);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      })
  }, []);
  return (
    <div className="flex flex-row  justify-center items-center">
      <div className="w-full md:w-2/3 xl:w-1/3 bg-white dark:bg-gray-700 border border-gray-200 rounded-lg shadow  dark:border-gray-700">
        {!loading && weatherData !== null ? (
          <div>
            <div className="flex flex-wrap font-medium text-center p-4 md:p-8 bg-gray-50 dark:bg-gray-800 text-gray-500 border-b border-gray-200  dark:border-gray-700 dark:text-gray-400  text-4xl justify-center">
              Météo actuelle à {weatherData['name']}
            </div>
            <div className="pb-4 px-4 rounded-lg md:pb-8 md:px-8">
              <div className="w-full justify-center flex flex-row items-center text-3xl capitalize">
                <div>
                  <img src={`https://openweathermap.org/img/wn/${weatherData!['weather'][0]['icon']}@2x.png`} alt="Weather Icon" />
                </div>
                <div>
                  {weatherData['weather'][0]['description']}
                </div>
              </div>
              <div className="flex flex-row">
                <div className="w-1/3 text-center">
                  <div className="text-sm dark:text-gray-400">Température</div>
                  <div className="text-2xl">{weatherData['main']['temp']}°C</div>
                </div>
                <div className="w-1/3 text-center">
                  <div className="text-sm dark:text-gray-400">Ressenti</div>
                  <div className="text-2xl">{weatherData['main']['feels_like']}°C</div>
                </div>
                <div className="w-1/3 text-center">
                  <div className="text-sm dark:text-gray-400">Vent</div>
                  <div className="text-2xl flex flex-row justify-around items-center">
                    <span>
                      {Math.round(weatherData!.wind.speed * 3.6)} km/h
                    </span>
                    <span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" style={{
                        rotate: `-${weatherData!.wind.deg}deg`
                      }}>
                        <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06l-6.22-6.22V21a.75.75 0 0 1-1.5 0V4.81l-6.22 6.22a.75.75 0 1 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap text-sm italic font-medium text-right justify-end p-4 text-gray-500 border-t border-gray-200 rounded-b-lg bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800">
              Dernière mise à jour : {new Date(weatherData['dt'] * 1000).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-center items-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="size-8 animate-spin" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V3.5A.75.75 0 0 1 12 2Z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
