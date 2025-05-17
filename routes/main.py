from flask import Blueprint, render_template, request, jsonify
from database.repository import get_weather_history, insert_weather_data
from services.weather_service import get_weather_data, get_weather_by_coords
from services.efficiency import calculate_efficiency
import requests
import os
from datetime import datetime

bp = Blueprint('main', __name__)

@bp.route('/', methods=['GET', 'POST'])
def index():
    city = request.form.get('city') if request.method == 'POST' else None
    temperature = None
    efficiency = None
    timestamp = None

    if city:
        try:
            weather = get_weather_data(city)
            temperature = weather["temperature"]
            efficiency = calculate_efficiency(temperature)
            insert_weather_data(city, temperature, efficiency)
            timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        except Exception as e:
            print("Erro ao obter dados do clima:", e)

    history = get_weather_history() or []
    return render_template("index.html", city=city or "", temperature=temperature,
                           efficiency=efficiency, timestamp=timestamp, history=[
                               [item["temperature"], item["efficiency"], item["datetime"]] for item in history
                           ])

@bp.route('/geolocate', methods=['POST'])
def geolocate():
    data = request.get_json()
    lat = data.get("lat")
    lon = data.get("lon")
    api_key = os.getenv("WEATHER_API_KEY")

    try:
        url = f"https://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={api_key}"
        response = requests.get(url)
        response.raise_for_status()
        result = response.json()
        city = result[0]["name"] if result else None
        return jsonify({"city": city})
    except Exception as e:
        print("Erro na geolocalização:", e)
        return jsonify({"city": None}), 500

@bp.route('/update', methods=['POST'])
def update():
    data = request.get_json()
    lat = data.get('lat')
    lon = data.get('lon')

    if lat is None or lon is None:
        return jsonify({'error': 'Coordenadas ausentes'}), 400

    weather = get_weather_by_coords(lat, lon)
    if not weather:
        return jsonify({'error': 'Erro ao obter dados climáticos'}), 500

    temp = weather['temperature']
    efficiency = calculate_efficiency(temp)
    insert_weather_data("auto-location", temp, efficiency)

    return jsonify({
        'temperature': temp,
        'efficiency': efficiency,
        'timestamp': datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    })

