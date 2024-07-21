import sys
from flask import Blueprint, request, jsonify, make_response
from flask_restful import Api, Resource
from datetime import datetime
import pandas as pd
from src.config import get_test, put_test
from ..decode.user_decode import token_required
import json
from loguru import logger

# Blueprint and API setup
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
            print(value)
            insert_query = """
            INSERT INTO medicines(name, batch_no, manufactured_by, quantity, expiry_date, mrp, tenant_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            record_to_insert = (
                value["name"], value["batchNo"], value["manufacturedBy"],
                value["quantity"], value["expiryDate"], value["mrp"], account_id['tenant_id']
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
            print(value)
            update_fields = {
                "name": value["name"],
                "batch_no": value["batchNo"],
                "manufactured_by": value["manufacturedBy"],
                "quantity": value["quantity"],
                "expiry_date": value["expiry_date"],
                "mrp": value["mrp"]
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

# Resource for retrieving all medicines
class GetMedicines(Resource):
    @token_required
    def get(account_id, self):
        connection = None
        try:
            start_time = datetime.now()
            connection = get_test()
            print(account_id)
            sql_select_query = """
            SELECT id, name, batch_no, manufactured_by, quantity, expiry_date, mrp FROM medicines WHERE tenant_id=%s ORDER BY expiry_date ASC
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

# Adding resources to the API endpoints
api.add_resource(AddMedicine, "/api/medicines/addmedicine")
api.add_resource(EditMedicine, "/api/medicines/edit")
api.add_resource(DeleteMedicine, "/api/medicines/delete")
api.add_resource(GetMedicines, "/api/medicines/getmedicines")
