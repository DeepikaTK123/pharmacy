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
                SELECT 'billing' AS table_name, COUNT(*) AS row_count FROM public.billing WHERE tenant_id = '{tenant_id}'
                UNION ALL
                SELECT 'billing_total_sum' AS table_name, COALESCE(SUM(total), 0) AS row_count FROM public.billing WHERE tenant_id = '{tenant_id}';
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
            value = request.json.get('period', 'weekly')  # Default to 'weekly'
            tenant_id = account_id["tenant_id"]

            # Determine the start date based on the period
            now = datetime.now()
            if value == 'weekly':
                start_date = now - timedelta(days=7, hours=5, minutes=30)
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
                interval = 'week'
            elif value == 'monthly':
                start_date = now - timedelta(days=30)
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
                interval = '3months'
            elif value == '3months':
                start_date = now - timedelta(days=90)  # Approximate 3 months
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
                interval = '3months'
            else:
                return make_response(jsonify({"status": "error", "message": "Invalid period", "data": {}}), 400)

            # Convert start_date to string format suitable for SQL query
            start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S')

            # SQL query to fetch data from the billing table
            if value in ['weekly', 'monthly','3months']:
                sql_select_query = f"""
                   WITH medicine_data AS (
    SELECT 
        DATE(date) AS interval_date,
        jsonb_array_elements(medicines::jsonb) AS medicine, -- Unnest the JSON array
        total,
        (jsonb_array_elements(medicines::jsonb)->>'quantity')::numeric AS quantity
    FROM 
        billing
    WHERE 
        date >= '{start_date_str}' AND tenant_id = '{tenant_id}'
)
SELECT 
    interval_date,
    SUM((medicine->>'mrp')::numeric * quantity) AS total_amount,
    SUM(((medicine->>'mrp')::numeric - (medicine->>'rate')::numeric) * quantity) AS total_profit
FROM 
    medicine_data
GROUP BY 
    interval_date
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

class GetHighBillingUsers(Resource):
    @token_required
    def get(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()

            tenant_id = account_id["tenant_id"]
            
            # SQL query to get users with the highest number of rows and highest bill amounts
            sql_select_query = f"""
                SELECT 
                    patient_name, 
                    phone_number,
                    COUNT(*) AS num_bills,
                    SUM(total) AS total_amount
                FROM 
                    public.billing
                WHERE 
                    tenant_id = '{tenant_id}'
                GROUP BY 
                    patient_name, phone_number
                ORDER BY 
                    total_amount DESC, num_bills DESC
                LIMIT 5;  -- Adjust the limit as needed
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

api.add_resource(GetHighBillingUsers, "/api/dashboard/gethighbillingusers")
