from flask import Blueprint, request, jsonify, make_response
from flask_restful import Api, Resource
from datetime import datetime
import pandas as pd
from src.config import get_test, put_test
from ..decode.user_decode import token_required
import json
from loguru import logger

# Blueprint and API setup
patients = Blueprint("patients", __name__)
api = Api(patients)

# Helper function to handle database errors and response
def handle_database_error(e, connection):
    logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
    logger.error(f"Exception: {str(e)}")
    if connection:
        put_test(connection)
    return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

# Resource for adding a new patient
class AddPatient(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json

            # Insert new patient
            insert_query = """
            INSERT INTO patients(tenant_id, patient_no, name, phone_number, dob, gender)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            record_to_insert = (
                account_id["tenant_id"],
                value["patientNo"],
                value["name"],
                value["phoneNumber"],
                value["dob"],
                value["gender"]
            )

            with connection.cursor() as cursor:
                cursor.execute(insert_query, record_to_insert)
                connection.commit()

            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time

            return make_response(jsonify({"status": "success", "message": "Added New Patient", "data": {}}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

# Resource for editing an existing patient
class EditPatient(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            patient_id = value["id"]

            update_fields = {
                "patient_no": value["patientNo"],
                "name": value["name"],
                "phone_number": value["phoneNumber"],
                "dob": value["dob"],
                "gender": value["gender"]
            }
            update_query = "UPDATE patients SET {} WHERE id=%s AND tenant_id=%s".format(
                            ", ".join("{}=%s".format(k) for k in update_fields.keys())
                        )
            with connection.cursor() as cursor:
                cursor.execute(update_query, list(update_fields.values()) + [patient_id, account_id["tenant_id"]])
                connection.commit()
            
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            
            return make_response(jsonify({"status": "success", "message": "Updated Successfully", "data": ""}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

# Resource for deleting a patient
class DeletePatient(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            patient_id = value["id"]

            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM patients WHERE id=%s AND tenant_id=%s", (patient_id, account_id["tenant_id"]))
                connection.commit()
            
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            
            return make_response(jsonify({"status": "success", "message": "Deleted Successfully", "data": ""}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

# Resource for retrieving all patients
class GetPatients(Resource):
    @token_required
    def get(account_id, self):
        connection = None
        try:
            start_time = datetime.now()
            connection = get_test()
            sql_select_query = """
            SELECT id, patient_no, name, phone_number, dob, gender, created_at, updated_at 
            FROM patients WHERE tenant_id=%s ORDER BY created_at ASC
            """
            df = pd.read_sql_query(sql_select_query, connection, params=(account_id["tenant_id"],))

            data_json = df.to_json(orient='records')
            data = json.loads(data_json)
            
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            
            return make_response(jsonify({"status": "success", "data": data}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

# Adding resources to the API endpoints
api.add_resource(AddPatient, "/api/patients/add")
api.add_resource(EditPatient, "/api/patients/edit")
api.add_resource(DeletePatient, "/api/patients/delete")
api.add_resource(GetPatients, "/api/patients/get")
