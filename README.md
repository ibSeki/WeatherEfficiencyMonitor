## ⚙️ Como Funciona?

- 🔍 Busca a temperatura do local (cidade ou coordenadas) via API do OpenWeather
- 📈 Calcula a eficiência da máquina de acordo com a temperatura:
  - 28°C ou mais → 100%
  - 24°C ou menos → 75%
  - Entre 24°C e 28°C → eficiência interpolada linearmente entre 75% e 100%
- 💾 Salva os dados (cidade, temperatura, eficiência e horário) no PostgreSQL
- 📊 Mostra histórico e permite exportação para Excel
- 🔄 Atualiza automaticamente a cada 30 segundos, mas também pode ser feito manualmente
- 🧹 Possui botão para limpar histórico

## 📁 Estrutura do Projeto

```
/database
├── connection.py
├── repository.py

/routes
└── main.py                # Blueprint Flask

/services
├── efficiency.py
└── weather_service.py

/static
├── css/
│   └── style.css
└── js/
    ├── geolocation.js
    └── main.js

/templates
└── index.html

config.py
run.py
requirements.txt
```

## 🚀 Como Usar

1. **Clone o repositório:**
```bash
git clone https://github.com/ibSeki/WeatherEfficiencyMonitor.git
cd WeatherEfficiencyMonitor
```

2. **Crie e ative o ambiente virtual:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

4. **Configure as variáveis de ambiente (.env ou no sistema):**
- `WEATHER_API_KEY` — sua chave da API do OpenWeather
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` — dados do PostgreSQL

5. **Prepare o banco de dados:**
- Crie a tabela `current_weather` conforme necessário

6. **Execute a aplicação:**
```bash
python run.py
```

7. **Acesse no navegador:**
[http://localhost:5000](http://localhost:5000)

## 🧪 Tecnologias Utilizadas

- Python + Flask
- PostgreSQL
- Requests (API OpenWeather)
- Pandas + OpenPyXL (exportar Excel)
- HTML, CSS, JavaScript (geolocalização, atualizações assíncronas)

## 👨‍💻 Contato

Ian de Barros Seki  
✉️ ian.dbseki@gmail.com  
🌐 [GitHub](https://github.com/ibSeki)  
🔗 [LinkedIn](https://www.linkedin.com/in/iandbseki)
