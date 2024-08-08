from flask import Blueprint, request, jsonify, make_response
from flask_restful import Api, Resource
from datetime import datetime
import pandas as pd
from src.config import get_test, put_test
from ..decode.user_decode import token_required
import json
from loguru import logger

# Blueprint and API setup
prescriptions = Blueprint("prescriptions", __name__)
api = Api(prescriptions)

# Helper function to handle database errors and response
def handle_database_error(e, connection):
    logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
    logger.error(f"Exception: {str(e)}")
    if connection:
        put_test(connection)
    return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

# Resource for adding a new prescription
class AddPrescription(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json

            cursor = connection.cursor()
            
            # Check if patient exists
            cursor.execute("SELECT id FROM patients WHERE phone_number=%s AND tenant_id=%s", (value.get("phoneNumber", ""), account_id["tenant_id"]))
            patient_id = cursor.fetchone()
            
            if not patient_id:
                # Insert new patient
                insert_patient_query = """
                INSERT INTO patients(tenant_id, patient_no, name, phone_number, dob, gender, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
                """
                patient_record_to_insert = (
                    account_id["tenant_id"], value.get("patientNumber", ""), value.get("patientName", ""), value.get("phoneNumber", ""), value.get("patientDob", ""),
                    value.get("patientGender", ""), start_time, start_time
                )
                cursor.execute(insert_patient_query, patient_record_to_insert)
                patient_id = cursor.fetchone()[0]
            else:
                patient_id = patient_id[0]

            insert_query = """
            INSERT INTO prescriptions(tenant_id, doctor_name, patient_name, phone_number, patient_id, patient_dob, patient_gender, blood_pressure, temperature, heart_beat, spo2, diagnosis, medication)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            record_to_insert = (
                account_id["tenant_id"],
                value["doctorName"],
                value["patientName"],
                value["phoneNumber"],
                patient_id,
                value["patientDob"],
                value["patientGender"],
                value["bloodPressure"],
                value["temperature"],
                value["heartBeat"],
                value["spo2"],
                value["diagnosis"],
                json.dumps(value["medications"])
            )

            cursor.execute(insert_query, record_to_insert)
            connection.commit()

            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time

            return make_response(jsonify({"status": "success", "message": "Added New Prescription", "data": {}}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

class EditPrescription(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            prescription_id = value["id"]

            cursor = connection.cursor()

            # Update the patient record
            update_patient_query = """
            UPDATE patients SET patient_no=%s, name=%s, phone_number=%s, dob=%s, gender=%s, updated_at=%s
            WHERE id=%s AND tenant_id=%s
            """
            patient_record_to_update = (
                value.get("patientId", ""), value.get("patientName", ""), value.get("phoneNumber", ""), value.get("patientDob", ""),
                value.get("patientGender", ""), start_time, value.get("patientId"), account_id["tenant_id"]
            )
            cursor.execute(update_patient_query, patient_record_to_update)

            update_fields = {
                "doctor_name": value["doctorName"],
                "patient_name": value["patientName"],
                "phone_number": value["phoneNumber"],
                "patient_id": value.get("patientId"),
                "patient_dob": value["patientDob"],
                "patient_gender": value["patientGender"],
                "blood_pressure": value["bloodPressure"],
                "temperature": value["temperature"],
                "heart_beat": value["heartBeat"],
                "spo2": value["spo2"],
                "diagnosis": value["diagnosis"],
                "medication": json.dumps(value["medications"])
            }
            update_query = "UPDATE prescriptions SET {} WHERE id=%s AND tenant_id=%s".format(
                            ", ".join("{}=%s".format(k) for k in update_fields.keys())
                        )
            cursor.execute(update_query, list(update_fields.values()) + [prescription_id, account_id["tenant_id"]])
            connection.commit()
            
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            
            return make_response(jsonify({"status": "success", "message": "Updated Successfully", "data": ""}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

# Resource for deleting a prescription
class DeletePrescription(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            prescription_id = value["id"]

            cursor = connection.cursor()
            cursor.execute("DELETE FROM prescriptions WHERE id=%s AND tenant_id=%s", (prescription_id, account_id["tenant_id"]))
            connection.commit()
            
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            
            return make_response(jsonify({"status": "success", "message": "Deleted Successfully", "data": ""}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

# Resource for retrieving all prescriptions
class GetPrescriptions(Resource):
    @token_required
    def get(account_id, self):
        connection = None
        try:
            start_time = datetime.now()
            connection = get_test()
            sql_select_query = """
            SELECT id, doctor_name, patient_name, phone_number, patient_id, patient_dob, patient_gender, blood_pressure, temperature, heart_beat, spo2, diagnosis, medication, created_at, updated_at 
            FROM prescriptions WHERE tenant_id=%s ORDER BY created_at ASC
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
api.add_resource(AddPrescription, "/api/prescriptions/add")
api.add_resource(EditPrescription, "/api/prescriptions/edit")
api.add_resource(DeletePrescription, "/api/prescriptions/delete")
api.add_resource(GetPrescriptions, "/api/prescriptions/get")
