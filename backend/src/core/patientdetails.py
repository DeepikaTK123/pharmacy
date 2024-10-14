from flask import Blueprint, request, jsonify, make_response
from flask_restful import Api, Resource
from datetime import datetime
import pandas as pd
from src.config import get_test, put_test
from ..decode.user_decode import token_required
import json
from loguru import logger

# Blueprint and API setup
patientdetails = Blueprint("patientdetails", __name__)
api = Api(patientdetails)

# Helper function to handle database errors and response
def handle_database_error(e, connection):
    logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
    logger.error(f"Exception: {str(e)}")
    if connection:
        put_test(connection)
    return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

# Resource for getting patient details
class GetPatientDetails(Resource):
    @token_required
    def get(account_id, self, patient_id):
        connection = None
        try:
            connection = get_test()
            sql_select_query = """
            SELECT id, patient_no, name, phone_number, dob, gender, doctor_name, created_at
            FROM patients WHERE tenant_id=%s AND id=%s
            """
            df = pd.read_sql_query(sql_select_query, connection, params=(account_id["tenant_id"], patient_id))
            data = df.to_dict(orient='records')
            put_test(connection)
            return make_response(jsonify({"status": "success", "data": data[0]}), 200)
        except Exception as e:
            return handle_database_error(e, connection)

# Resource for getting health data
class GetHealthData(Resource):
    @token_required
    def get(account_id, self, patient_id):
        connection = None
        try:
            connection = get_test()
            
            # Query to fetch patient health data from the 'records' table
            sql_select_query = """
            SELECT id AS record_id, patient_id, diagnosis, blood_pressure, heart_rate, temperature, spo2, additional_instructions, doctor_name, created_at
            FROM records 
            WHERE  patient_id=%s
            """
            df_records = pd.read_sql_query(sql_select_query, connection, params=( patient_id,))
            records_data = df_records.to_dict(orient='records')

            # For each record, fetch the associated marks from the 'marks' table
            for record in records_data:
                record_id = record['record_id']
                sql_marks_query = """
                SELECT markx, marky, markcolor 
                FROM marks 
                WHERE record_id=%s
                """
                df_marks = pd.read_sql_query(sql_marks_query, connection, params=(record_id,))
                record['marks'] = df_marks.to_dict(orient='records')

            put_test(connection)
            return make_response(jsonify({"status": "success", "data": records_data}), 200)
        except Exception as e:
            return handle_database_error(e, connection)

# Resource for getting prescriptions
class GetPrescriptions(Resource):
    @token_required
    def get(account_id, self, patient_id):
        connection = None
        try:
            connection = get_test()
            
            # Fetch prescriptions for the given patient_id
            sql_select_query = """
            SELECT id, patient_id, doctor_name, diagnosis, additional_instructions AS instruction, created_at
            FROM records WHERE patient_id=%s
            """
            df = pd.read_sql_query(sql_select_query, connection, params=(patient_id,))
            prescriptions = df.to_dict(orient='records')

            for prescription in prescriptions:
                record_id = prescription['id']
                
                # Fetch medications for the prescription record
                sql_medications_query = """
                SELECT medicine_name AS name, quantity, 
                    CONCAT(morning_dose, '-', afternoon_dose, '-', evening_dose) AS timings, food
                FROM prescriptions WHERE record_id=%s
                """
                meds_df = pd.read_sql_query(sql_medications_query, connection, params=(record_id,))
                prescription['medications'] = meds_df.to_dict(orient='records')

                # Fetch services for the prescription record
                sql_services_query = """
                SELECT service_name, price
                FROM prescription_services WHERE record_id=%s
                """
                services_df = pd.read_sql_query(sql_services_query, connection, params=(record_id,))
                prescription['services'] = services_df.to_dict(orient='records')

            put_test(connection)
            return make_response(jsonify({"status": "success", "data": prescriptions}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

# Resource for getting bills
class GetBills(Resource):
    @token_required
    def get(account_id, self, patient_id):
        connection = None
        try:
            connection = get_test()
            sql_select_query = """
            SELECT id, patient_id, total, date 
            FROM billing WHERE patient_id=%s
            """
            df = pd.read_sql_query(sql_select_query, connection, params=( str(patient_id),))
            data = df.to_dict(orient='records')
            put_test(connection)
            return make_response(jsonify({"status": "success", "data": data}), 200)
        except Exception as e:
            return handle_database_error(e, connection)
        
class AddRecord(Resource):
    @token_required
    def post(account_id, self):
        connection = None
        try:
            connection = get_test()
            data = request.json

            # Insert record into records table
            insert_record_query = '''
                INSERT INTO records (patient_id, diagnosis, blood_pressure, heart_rate, temperature, spo2, additional_instructions, doctor_name) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
            '''
            record_data = (
                data["patientId"],  # patient_id from the payload
                data["diagnosis"],
                data["bloodPressure"],
                data["heartRate"],
                data["temperature"],
                data["spo2"],
                data["additionalInstructions"],
                data["doctorName"]
            )

            with connection.cursor() as cursor:
                cursor.execute(insert_record_query, record_data)
                record_id = cursor.fetchone()[0]

                # Insert prescriptions into prescriptions table
                for prescription in data["prescription"]:
                    insert_prescription_query = '''
                        INSERT INTO prescriptions (record_id,patient_id,medicine_id, medicine_name, quantity, food, morning_dose, afternoon_dose, evening_dose)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                    '''
                    prescription_data = (
                        record_id,
                        data["patientId"],
                        prescription["value"],  # medicine_id
                        prescription["label"],  # medicine_name
                        prescription["quantity"],  # quantity
                        prescription["food"],  # food
                        prescription["timings"]["morning"],  # morning_dose
                        prescription["timings"]["afternoon"],  # afternoon_dose
                        prescription["timings"]["evening"]  # evening_dose
                    )
                    cursor.execute(insert_prescription_query, prescription_data)

                # Insert services into prescription_services table
                for service in data["services"]:
                    insert_service_query = '''
                        INSERT INTO prescription_services (record_id,patient_id, service_id, service_name, price)
                        VALUES (%s,%s, %s, %s, %s);
                    '''
                    service_data = (
                        record_id,
                        data["patientId"],
                        service["value"],  # service_id
                        service["label"],  # service_name
                        service["price"]  # price
                    )
                    cursor.execute(insert_service_query, service_data)

                # Insert marks into marks table
                for mark in data["marksList"]:
                    insert_mark_query = '''
                        INSERT INTO marks (record_id,patient_id, markx, marky, markcolor)
                        VALUES (%s,%s, %s, %s, %s);
                    '''
                    mark_data = (
                        record_id,
                        data["patientId"],
                        mark["markx"],  # markX
                        mark["marky"],  # markY
                        mark["markcolor"]  # markColor
                    )
                    cursor.execute(insert_mark_query, mark_data)

                connection.commit()

            put_test(connection)
            return make_response(jsonify({"status": "success", "message": "Record added successfully"}), 200)

        except Exception as e:
            return handle_database_error(e, connection)


api.add_resource(AddRecord, "/api/patient/record/add")

# Adding resources to the API endpoints
api.add_resource(GetPatientDetails, "/api/patient/details/<int:patient_id>")
api.add_resource(GetHealthData, "/api/patient/healthdata/<int:patient_id>")
api.add_resource(GetPrescriptions, "/api/patient/prescriptions/<int:patient_id>")
api.add_resource(GetBills, "/api/patient/bills/<int:patient_id>")
