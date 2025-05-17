import requests
import os

def get_weather_data(city):
    api_key = os.getenv('WEATHER_API_KEY')
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"

    response = requests.get(url)
    response.raise_for_status()

    data = response.json()
    temperature = data['main']['temp']

    return {'temperature': temperature}

def get_weather_by_coords(lat, lon):
    api_key = os.getenv('WEATHER_API_KEY')
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    temperature = data['main']['temp']
    return {'temperature': temperature}

