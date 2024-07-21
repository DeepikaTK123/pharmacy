"""Run File."""
from src import create_app
from src.config import DevConfig, ProdConfig

if __name__ == "__main__":
    create_app(DevConfig).run(host="0.0.0.0",port = 5000)
    # create_app(ProdConfig).run(host="0.0.0.0")
