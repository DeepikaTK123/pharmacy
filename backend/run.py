"""Run File."""
from src import create_app
from src.config import DevConfig, ProdConfig

app = create_app(DevConfig)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
