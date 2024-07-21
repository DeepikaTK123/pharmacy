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


tenant = Blueprint("tenant", __name__)
api = Api(tenant)


class GetTenants(Resource):
    def get(self):
        connection = None
        try:
            start_time = datetime.now()
            connection = get_test() 
            sql_select_query = """SELECT tenant_id,username, phonenumber, email, company_name FROM tenants"""
            df = pd.read_sql_query(sql_select_query, connection)
            put_test(connection)            
            x = df.to_json(orient='records')
            x = json.loads(x)            
            end_time = datetime.now()
            time_taken = end_time - start_time
            logger.info("Fetching all tenants: " + str(round(time_taken.total_seconds(), 2)))
            return make_response(jsonify({"status": "success", "data": x}), 200)
        except Exception as e:
            exception_type, exception_object, exception_traceback = sys.exc_info()
            line_number = exception_traceback.tb_lineno
            logger.error("Error in line: " + str(line_number))
            logger.error("Exception in fetching GetTenants list: " + str(e))
            if connection:
                put_test(connection)
            return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)


api.add_resource(GetTenants, "/api/admin/tenant/gettenants")


class TenantRegister(Resource):
    def post(self):
        start_time = datetime.now()
        connection = None
        try:
            value = request.json
            generate_tenant_id = str(uuid.uuid4().int)[:12]
            value['tenant_id'] = value["username"] + generate_tenant_id
            connection = get_test()
            
            with connection.cursor() as cursor:
                insert_query = """INSERT INTO tenants(username, email, phonenumber, password, company_name, address, pincode, gst, registration_date, tenant_id)
                                  VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                record_to_insert = (
                    value["username"], value["email"], value["phonenumber"], value["password"], 
                    value["company_name"], value["address"], value["pincode"], value["gst"], 
                    start_time, value["tenant_id"]
                )
                cursor.execute(insert_query, record_to_insert)
                connection.commit()
                return make_response(jsonify({"status": "success", "message": "Your request is approved", "data": ""}), 200)
               
        except Exception as e:
            exception_type, exception_object, exception_traceback = sys.exc_info()
            line_number = exception_traceback.tb_lineno
            logger.error("Error in line: " + str(line_number))
            logger.error("Exception: " + str(e))
            if connection:
                connection.rollback()
            return make_response(jsonify({"status": "error", "message": "Internal server error", "data": {}}), 500)

api.add_resource(TenantRegister, "/api/admin/tenant/registertenant")

