import sys
from flask import Blueprint, request, jsonify, make_response
from src.config import get_test, put_test
from flask_restful import Api, Resource
from loguru import logger
from datetime import datetime, timedelta
import jwt
from ..decode.user_decode import token_required
from flask import current_app

users = Blueprint("users", __name__)
api = Api(users)

class Login(Resource):
    def post(self):
        start_time = datetime.now()
       
        try:
            value = request.json
            print(value)
            connection = get_test()
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT tenant_id, username, email, company_name, phonenumber, address, pincode, gst 
                    FROM tenants 
                    WHERE email=%s AND password=%s
                """, (value['email'], value['password']))
                x = cursor.fetchone()
                put_test(connection)
                if x:
                    token = jwt.encode({"public_id": {"tenant_id": x[0], "user_id": ""}, "exp": datetime.now() + timedelta(days=15)},
                                        current_app.config["SECRET_KEY"], "HS256")
                    # Convert tuple to dictionary
                    data = {
                        "tenant_id": x[0],
                        "username": x[1],
                        "email": x[2],
                        "company_name": x[3],
                        "phonenumber": x[4],
                        "address": x[5],
                        "pincode": x[6],
                        "gst": x[7]
                    }
                    
                    end_time = datetime.now()
                    time_taken = end_time - start_time
                    logger.info("Time taken to Login: " + str(round(time_taken.total_seconds(), 2)))
                    return make_response(jsonify({"status": "Login success", "message": token.decode("utf-8"), "data": data}), 200)
                else:
                    return make_response(jsonify({"status": "failure", "message": "Invalid email or password", "data": {}}), 400)
        except Exception as e:
            exception_type, exception_object, exception_traceback = sys.exc_info()
            line_number = exception_traceback.tb_lineno
            logger.error("Error in line: " + str(line_number))
            logger.error("Exception: " + str(e))
            if connection:
                connection.rollback()
            return make_response(jsonify({"status": "error", "message": "Internal server error", "data": {}}), 500)

api.add_resource(Login, "/api/users/login")
