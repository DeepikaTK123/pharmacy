"""app_wsgi."""
from flask import Flask
from flask_cors import CORS
from loguru import logger
import logging
import os
from uuid import uuid4
from flask_compress import Compress


class InterceptHandler(logging.Handler):
    def emit(self, record):
        logger_opt = logger.opt(depth=6, exception=record.exc_info)
        logger_opt.log(record.levelno, record.getMessage())


# compress flask assets and responses
compress = Compress()

def create_app(config):
    """Create_app."""
    app = Flask(__name__)
    app.config.from_object(config)
    secrete_key = str(uuid4())
    app.config['SECRET_KEY'] = secrete_key
    compress.init_app(app)
    CORS(app)

    path = os.path.join(os.getcwd(), 'logs', 'log_{time:YYYY-MM-DD}.log')
    logger.start(path, level='DEBUG', format="{time} {level} {message}",
                 backtrace=False, rotation='00:00', catch=True)
    # register loguru as handler
    app.logger.addHandler(InterceptHandler())
    # Register blueprints
    from src.core.users import users
    from src.core.dashboard import dashboard
    from src.core.medicines import medicines
    from src.core.billing_and_payments import billing_bp
    from src.admin.tenant import tenant

    app.register_blueprint(users)
    app.register_blueprint(dashboard)
    app.register_blueprint(medicines)
    app.register_blueprint(billing_bp)
    app.register_blueprint(tenant)


    return app
    
   