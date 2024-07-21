import sys
from flask import Blueprint, request, jsonify, make_response
from flask_restful import Api, Resource
from datetime import datetime, timedelta
import psycopg2
import json
import pandas as pd
from src.config import get_test, put_test
from ..decode.user_decode import token_required
from loguru import logger

dashboard = Blueprint("dashboard", __name__)
api = Api(dashboard)

class GetDashboardCount(Resource):
    @token_required
    def get(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            
            tenant_id = account_id["tenant_id"]
            
            sql_select_query = f"""
                SELECT 'medicines' AS table_name, COUNT(*) AS row_count FROM public.medicines WHERE tenant_id = '{tenant_id}'
                UNION ALL
                SELECT 'billing' AS table_name, COUNT(*) AS row_count FROM public.billing WHERE tenant_id = '{tenant_id}';
            """
            df = pd.read_sql_query(sql_select_query, connection)
            data_json = df.to_json(orient='records')
            data = json.loads(data_json)
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            return make_response(jsonify({"status": "success", "data": data}), 200)
        except Exception as e:
            exception_type, exception_object, exception_traceback = sys.exc_info()
            line_number = exception_traceback.tb_lineno
            logger.error("Error in line: " + str(line_number))
            logger.error("Exception: " + str(e))
            if connection:
                put_test(connection)
            return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

api.add_resource(GetDashboardCount, "/api/dashboard/getdashboardcount")


class GetRevenueChart(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json.get('period', 'daily')
            tenant_id = account_id["tenant_id"]
            
            # Determine the start date based on the period
            now = datetime.now()
            if value == 'daily':
                start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
                interval = 'hour'
            elif value == 'weekly':
                start_date = now - timedelta(days=now.weekday())
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
                interval = 'day'
            elif value == 'monthly':
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                interval = 'day'
            elif value == 'yearly':
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                interval = 'month'
            else:
                return make_response(jsonify({"status": "error", "message": "Invalid period", "data": {}}), 400)

            # Convert start_date to string format suitable for SQL query
            start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')

            # SQL query to fetch data from the billing table
            sql_select_query = f"""
                SELECT 
                    total AS amount, 
                    last_updated AS interval_date
                FROM 
                    billing
                WHERE 
                    date >= '{start_date_str}' AND tenant_id = '{tenant_id}'
                ORDER BY 
                    interval_date ASC;
            """
            df = pd.read_sql_query(sql_select_query, connection)
            data_json = df.to_json(orient='records')
            data = json.loads(data_json)
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            return make_response(jsonify({"status": "success", "data": data}), 200)
        except Exception as e:
            exception_type, exception_object, exception_traceback = sys.exc_info()
            line_number = exception_traceback.tb_lineno
            logger.error("Error in line: " + str(line_number))
            logger.error("Exception: " + str(e))
            if connection:
                put_test(connection)
            return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

api.add_resource(GetRevenueChart, "/api/dashboard/getrevenuechart")

class GetLowStockMedicines(Resource):
    @token_required
    def get(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            
            tenant_id = account_id["tenant_id"]
            
            sql_select_query = f"""
                SELECT * FROM public.medicines WHERE quantity < 20 AND tenant_id = '{tenant_id}';
            """
            df = pd.read_sql_query(sql_select_query, connection)
            data_json = df.to_json(orient='records')
            data = json.loads(data_json)
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            return make_response(jsonify({"status": "success", "data": data}), 200)
        except Exception as e:
            exception_type, exception_object, exception_traceback = sys.exc_info()
            line_number = exception_traceback.tb_lineno
            logger.error("Error in line: " + str(line_number))
            logger.error("Exception: " + str(e))
            if connection:
                put_test(connection)
            return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

api.add_resource(GetLowStockMedicines, "/api/dashboard/getlowstockmedicines")
