# WeatherEfficiencyMonitor

Projeto simples em Python + Flask que monitora a eficiência de uma máquina com base na temperatura ambiente obtida pela API do OpenWeather. Você pode ver o histórico, atualizar manualmente, usar geolocalização e exportar os dados para Excel.

---

## Como funciona?

- Busca a temperatura do local (cidade ou coordenadas) na API do OpenWeather  
- Calcula a eficiência da máquina de acordo com a temperatura:
  - 28 °C ou mais → 100 %
  - 24 °C ou menos → 75 %
  - Entre 24 °C e 28 °C → eficiência interpolada linearmente entre 75 % e 100 %  
- Salva esses dados (cidade, temperatura, eficiência e horário) no banco PostgreSQL  
- Mostra o histórico e permite exportar para Excel  
- Atualiza automaticamente a cada 30 segundos, mas também tem atualização manual e limpeza do histórico  

---

## Estrutura do projeto

/database
connection.py
repository.py

/routes
main.py # blueprint Flask

/services
efficiency.py
weather_service.py

/static
/css
style.css
/js
geolocation.js
main.js

/templates
index.html

config.py
run.py
requirements.txt

---

## Como usar

1. Clone o repo:
   ```bash
   git clone https://github.com/ibSeki/WeatherEfficiencyMonitor.git
   cd WeatherEfficiencyMonitor

2. Crie e ative o ambiente virtual:
  python -m venv venv
  source venv/bin/activate   # Linux/Mac
  venv\Scripts\activate      # Windows

3. Instale as dependências:
  pip install -r requirements.txt

4. Configure as variáveis de ambiente (exemplo em .env ou no sistema):
  WEATHER_API_KEY=your_openweather_api_key
  DB_NAME=seu_banco
  DB_USER=seu_usuario
  DB_PASSWORD=sua_senha
  DB_HOST=localhost
  DB_PORT=5432

5. Prepare o banco de dados (exemplo de tabela):
  CREATE TABLE current_weather (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100),
  temperature REAL,
  efficiency REAL,
  datetime TIMESTAMP
  );

6. Rode a aplicação:
  python run.py

7. Acesse no navegador:
  http://localhost:5000

---

## Tecnologias

  Python + Flask
  PostgreSQL
  Requests (API OpenWeather)
  Pandas e OpenPyXL (exportar Excel)
  HTML, CSS, JavaScript no front-end

## Contato

  Ian de Barros Seki
  ✉️ ian.dbseki@gmail.com
  GitHub: https://github.com/ibSeki
  LinkedIn: www.linkedin.com/in/iandbseki

## Link do projeto no GitHub

  https://github.com/ibSeki/WeatherEfficiencyMonitor
