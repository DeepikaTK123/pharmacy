from src.config import get_test, put_test
from flask import Blueprint, request, jsonify, make_response
from datetime import datetime
from loguru import logger
from flask import jsonify, make_response, request
from flask_restful import Resource, Api
import sys
from werkzeug.security import generate_password_hash
import psycopg2
import jwt
import uuid
from datetime import datetime, timedelta
from math import ceil
import pandas as pd
import bcrypt
import json
from werkzeug.security import check_password_hash
from src import config
from psycopg2.extras import NamedTupleCursor
from flask import current_app


admin = Blueprint("admin", __name__)
api = Api(admin)


class AdminLogin(Resource):
    def post(self):
        start_time = datetime.now()
        try:
            value = request.json
            connection = get_test()
            with connection.cursor() as cursor:
                cursor.execute("""select email,password from admin WHERE email='%s' and password='%s'""" %
                                   (value["email"], value["password"]))
                x = cursor.fetchone()
                if x is None:
                    return make_response(jsonify({"status": "Failure",
                                                  "message": "No data found",
                                                  "data":""}), 400)
                else:
                    token = jwt.encode({"public_id": {"tenant_id": x[0], "user_id": ""}, "exp": datetime.now() + timedelta(minutes=15)},
                                                        current_app.config["SECRET_KEY"], "HS256")
                    put_test(connection)
                    end_time = datetime.now()
                    time_taken = end_time - start_time
                    logger.info("Time taken to Login: " + str(round(time_taken.total_seconds(), 2)))
                    return make_response(jsonify({"status": "Login success", "message": "token", "data": x}), 200)
                   
                
        except Exception as e:
            exception_type, exception_object, exception_traceback = sys.exc_info()
            line_number = exception_traceback.tb_lineno
            logger.error("Error in line: " + str(line_number))
            logger.error("Exception: " + str(e))
            if connection:
                connection.rollback()
            return make_response(jsonify({"status": "error", "message": "Internal server error", "data": {}}), 500)


api.add_resource(AdminLogin, "/api/admin/admin/adminlogin")
