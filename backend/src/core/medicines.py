import sys
from flask import Blueprint, request, jsonify, make_response
from flask_restful import Api, Resource
from datetime import datetime
import pandas as pd
from src.config import get_test, put_test
from ..decode.user_decode import token_required
import json
from loguru import logger

medicines = Blueprint("medicines", __name__)
api = Api(medicines)

# Helper function to handle database errors and response
def handle_database_error(e, connection):
    logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
    logger.error(f"Exception: {str(e)}")
    if connection:
        put_test(connection)
    return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)


# Resource for adding a new medicine
class AddMedicine(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json

            # Check for duplicate medicine
            check_query = """
            SELECT COUNT(*) FROM medicines
            WHERE name = %s AND batch_no = %s AND manufactured_by = %s AND tenant_id = %s
            """
            check_values = (value["name"], value["batchNo"], value["manufacturedBy"], account_id['tenant_id'])

            with connection.cursor() as cursor:
                cursor.execute(check_query, check_values)
                result = cursor.fetchone()
                if result[0] > 0:
                    return make_response(jsonify({"status": "error", "message": "Medicine with same batch and manufacturer already exists"}), 409)

            # Insert new medicine
            insert_query = """
            INSERT INTO medicines(name, batch_no, manufactured_by, quantity, expiry_date, mrp, cgst, sgst, total, rate, profit, tenant_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            record_to_insert = (
                value["name"], value["batchNo"], value["manufacturedBy"],
                value["quantity"], value["expiryDate"], value["mrp"], value["cgst"], value["sgst"], value["total"], value["rate"], value["profit"], account_id['tenant_id']
            )

            with connection.cursor() as cursor:
                cursor.execute(insert_query, record_to_insert)
                connection.commit()

            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time

            return make_response(jsonify({"status": "success", "message": "Added New Medicine", "data": {}}), 200)

        except Exception as e:
            return handle_database_error(e, connection)


# Resource for editing an existing medicine
class EditMedicine(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            medicine_id = value["id"]

           

            update_fields = {
                "name": value["name"],
                "batch_no": value["batchNo"],
                "manufactured_by": value["manufacturedBy"],
                "quantity": value["quantity"],
                "expiry_date": value["expiry_date"],
                "mrp": value["mrp"],
                "cgst": value["cgst"],
                "sgst": value["sgst"],
                "total": value["total"],
                "rate": value["rate"],
                "profit": value["profitLoss"]
            }
            update_query = "UPDATE medicines SET {} WHERE id=%s AND tenant_id=%s".format(
                            ", ".join("{}=%s".format(k) for k in update_fields.keys())
                        )
            with connection.cursor() as cursor:
                cursor.execute(update_query, list(update_fields.values()) + [medicine_id, account_id['tenant_id']])
                connection.commit()
            
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            
            return make_response(jsonify({"status": "success", "message": "Updated Successfully", "data": ""}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

# Resource for deleting a medicine
class DeleteMedicine(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            medicine_id = value["id"]

            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM medicines WHERE id=%s AND tenant_id=%s", (medicine_id, account_id['tenant_id']))
                connection.commit()
            
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            
            return make_response(jsonify({"status": "success", "message": "Deleted Successfully", "data": ""}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

class GetMedicines(Resource):
    @token_required
    def get(account_id, self):
        connection = None
        try:
            start_time = datetime.now()
            connection = get_test()

            # Fetch medicines for the tenant
            sql_select_medicines_query = """
            SELECT id, name, batch_no, manufactured_by, quantity, expiry_date, mrp, cgst, sgst, total, rate, profit 
            FROM medicines WHERE tenant_id=%s ORDER BY expiry_date ASC
            """
            df_medicines = pd.read_sql_query(sql_select_medicines_query, connection, params=(account_id['tenant_id'],))

            # Fetch alerts related to quantity and expiry for the tenant
            sql_select_alerts_query = """
            SELECT value, label, color, type 
            FROM alerts 
            WHERE tenant_id=%s 
            ORDER BY value ASC
            """
            df_alerts = pd.read_sql_query(sql_select_alerts_query, connection, params=(account_id['tenant_id'],))

            # Split alerts into separate DataFrames for quantity and expiry
            quantity_alerts = df_alerts[df_alerts['type'] == 'Quantity']
            expiry_alerts = df_alerts[df_alerts['type'] == 'Expiry']

            # Get the current date
            current_date = datetime.now().date()

            # Convert the medicines data to a list of dictionaries
            medicines = df_medicines.to_dict(orient='records')

            # Function to determine quantity color based on alerts
            def get_quantity_color(medicine_quantity):
                for _, alert in quantity_alerts.iterrows():
                    if alert['label'] == 'less than' and medicine_quantity < alert['value']:
                        return alert['color']
                    elif alert['label'] == 'greater than' and medicine_quantity > alert['value']:
                        return alert['color']
                return None

            # Function to determine expiry color based on alerts
            def get_expiry_color(medicine_expiry_date):
                # Assume medicine_expiry_date is already a datetime.date object, no need to convert
                days_until_expiry = (medicine_expiry_date - current_date).days

                for _, alert in expiry_alerts.iterrows():
                    if alert['label'] == 'days' and days_until_expiry <= int(alert['value']):
                        return alert['color']
                    elif alert['label'] == 'months':
                        days_in_months = int(alert['value']) * 30  # Assuming 30 days in a month
                        if days_until_expiry <= days_in_months:
                            return alert['color']
                return None

            # Apply the color functions to each medicine
            for medicine in medicines:
                medicine['quantityColor'] = get_quantity_color(medicine['quantity'])
                medicine['expiryColor'] = get_expiry_color(medicine['expiry_date'])

            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time

            return make_response(jsonify({"status": "success", "data": medicines}), 200)

        except Exception as e:
            return handle_database_error(e, connection)
        
class CreateAlert(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            # Insert new alert with label and value
            insert_query = """
            INSERT INTO alerts(type, value, label, color, tenant_id)
            VALUES (%s, %s, %s, %s, %s)
            """
            record_to_insert = (
                value["type"],      # Either "Quantity" or "Expiry"
                value["value"],     # The threshold value for the alert
                value["label"],     # For Quantity: "less than" or "greater than", For Expiry: "days" or "months"
                value["color"],     # The color for the alert
                account_id['tenant_id']
            )

            with connection.cursor() as cursor:
                cursor.execute(insert_query, record_to_insert)
                connection.commit()

            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time

            return make_response(jsonify({"status": "success", "message": "Alert Created Successfully", "data": {}}), 200)

        except Exception as e:
            return handle_database_error(e, connection)


# Resource for getting all alerts
class GetAlerts(Resource):
    @token_required
    def get(account_id, self):
        connection = None
        try:
            start_time = datetime.now()
            connection = get_test()

            # Fetch alerts with label and value
            sql_select_query = """
            SELECT id, type, value, label, color FROM alerts WHERE tenant_id=%s ORDER BY id ASC
            """
            df = pd.read_sql_query(sql_select_query, connection, params=(account_id['tenant_id'],))

            data_json = df.to_json(orient='records')
            data = json.loads(data_json)
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time

            return make_response(jsonify({"status": "success", "data": data}), 200)

        except Exception as e:
            return handle_database_error(e, connection)


# Resource for deleting an alert
class DeleteAlert(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            alert_id = value["id"]

            # Delete the alert by its ID
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM alerts WHERE id=%s AND tenant_id=%s", (alert_id, account_id['tenant_id']))
                connection.commit()

            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time

            return make_response(jsonify({"status": "success", "message": "Alert Deleted Successfully", "data": ""}), 200)

        except Exception as e:
            return handle_database_error(e, connection)


api.add_resource(AddMedicine, "/api/medicines/addmedicine")
api.add_resource(EditMedicine, "/api/medicines/edit")
api.add_resource(DeleteMedicine, "/api/medicines/delete")
api.add_resource(GetMedicines, "/api/medicines/getmedicines")
api.add_resource(CreateAlert, "/api/alerts/create")
api.add_resource(GetAlerts, "/api/alerts/get")
api.add_resource(DeleteAlert, "/api/alerts/delete")