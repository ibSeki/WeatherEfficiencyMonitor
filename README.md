# WeatherEfficiencyMonitor

Projeto simples em Python + Flask que monitora a eficiência de uma máquina com base na temperatura ambiente obtida pela API do OpenWeather. Você pode ver o histórico, atualizar manualmente, usar geolocalização e exportar os dados para Excel.

---

## Como funciona?

- Busca a temperatura do local (cidade ou coordenadas) na API do OpenWeather
- Calcula a eficiência da máquina de acordo com a temperatura:
  - 28°C ou mais → 100%
  - 24°C ou menos → 75%
  - Entre 24°C e 28°C → eficiência interpolada linearmente entre 75% e 100%
- Salva esses dados (cidade, temperatura, eficiência e horário) no banco PostgreSQL
- Mostra o histórico e permite exportar para Excel
- Atualiza automaticamente a cada 30 segundos, mas também tem atualização manual e limpeza do histórico

---

## Estrutura do projeto

/database
connection.py
repository.py

/routes
main.py (blueprints Flask)

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

yaml
Copiar
Editar

---

## Como usar

1. Clone o repo:
```bash
git clone https://github.com/ibSeki/WeatherEfficiencyMonitor.git
cd WeatherEfficiencyMonitor
Crie e ative o ambiente virtual:

bash
Copiar
Editar
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
Instale as dependências:

bash
Copiar
Editar
pip install -r requirements.txt
Configure as variáveis de ambiente (exemplo em .env ou no sistema):

WEATHER_API_KEY — sua chave da API do OpenWeather

DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT — dados do seu banco PostgreSQL

Prepare o banco de dados (crie a tabela current_weather conforme necessário).

Rode a aplicação:

bash
Copiar
Editar
python run.py
Acesse http://localhost:5000

Tecnologias
Python + Flask

PostgreSQL

Requests (API OpenWeather)

Pandas e OpenPyXL (exportar Excel)

HTML, CSS, JavaScript no front-end

Contato
Ian de Barros Seki
✉️ ian.dbseki@gmail.com
GitHub: https://github.com/ibSeki
LinkedIn: www.linkedin.com/in/iandbseki

Link do projeto no GitHub
https://github.com/ibSeki/WeatherEfficiencyMonitor.git
