from flask import Blueprint, render_template, request, jsonify
from database.repository import get_weather_history, insert_weather_data, clear_weather_history
from services.weather_service import get_weather_data
from services.efficiency import calculate_efficiency
from datetime import datetime
from flask import send_file
from io import BytesIO
from database.repository import generate_excel
import requests
import os

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

    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={os.getenv('WEATHER_API_KEY')}&units=metric"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        temp = data['main']['temp']
        efficiency = calculate_efficiency(temp)
        insert_weather_data("auto-location", temp, efficiency)

        return jsonify({
            'temperature': temp,
            'efficiency': efficiency
        })
    except Exception as e:
        print("Erro ao obter dados climáticos:", e)
        return jsonify({'error': 'Erro ao obter dados climáticos'}), 500

@bp.route('/clear-history', methods=['POST'])
def clear_history():
    try:
        clear_weather_history()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Erro ao limpar histórico: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@bp.route('/download-excel')
def download_excel():
    excel_file = generate_excel()
    if not excel_file:
        return "Nenhum dado para exportar.", 404

    return send_file(
        excel_file,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='historico_maquina.xlsx'
    )