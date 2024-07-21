from functools import wraps
from flask import request, jsonify, make_response
import jwt
from src.config import get_test, put_test
from flask import current_app
import pandas as pd
from flask_restful import Resource
from datetime import datetime
import logging
import sys


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        if 'access-token' in request.headers:
            token = request.headers['access-token']
        if not token:
            logger.error(f"Exception: Valid token is missing")
            return make_response(jsonify({'message': 'Valid token is missing', "status": "logout"}), 401)
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            connection = get_test()
            with connection.cursor() as cursor:
                cursor.execute("SELECT tenant_id FROM tenants WHERE tenant_id=%s", (data["public_id"]["tenant_id"],))
                x = cursor.fetchone()
            put_test(connection)
            if x is None:
                logger.error(f"Exception: User doesn't exist, please contact admin")
                return make_response(jsonify({"status": "failure", "message": "User doesn't exist, please contact admin", "data": {}}), 401)
            
            tenant_id = data["public_id"] 
        except Exception as e:
            exception_type, exception_object, exception_traceback = sys.exc_info()
            line_number = exception_traceback.tb_lineno
            logger.error("Error in line: " + str(line_number))
            logger.error(f"Exception: {str(e)}")
            return make_response(jsonify({'message': 'Token is invalid', "status": "logout"}), 401)
        return f(tenant_id, *args, **kwargs)
    return decorator