# from flask import Blueprint, request, jsonify, make_response
# from flask_restful import Api, Resource
# from datetime import datetime
# import pandas as pd
# from src.config import get_test, put_test
# from ..decode.user_decode import token_required
# import json
# from loguru import logger

# # Blueprint and API setup
# patientdetails = Blueprint("patientdetails", __name__)
# api = Api(patientdetails)

# # Helper function to handle database errors and response
# def handle_database_error(e, connection):
#     logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
#     logger.error(f"Exception: {str(e)}")
#     if connection:
#         put_test(connection)
#     return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

# # Resource for getting patient details
# class GetPatientDetails(Resource):
#     @token_required
#     def get(account_id, self, patient_id):
#         connection = None
#         try:
#             start_time = datetime.now()
#             connection = get_test()

#             sql_select_query = """
#             SELECT id, patient_no, name, phone_number, dob, gender 
#             FROM patients WHERE tenant_id=%s AND id=%s
#             """
#             df = pd.read_sql_query(sql_select_query, connection, params=(account_id["tenant_id"], patient_id))
            
#             data_json = df.to_json(orient='records')
#             data = json.loads(data_json)
            
#             put_test(connection)
#             end_time = datetime.now()
#             time_taken = end_time - start_time
            
#             return make_response(jsonify({"status": "success", "data": data}), 200)

#         except Exception as e:
#             return handle_database_error(e, connection)

# # Resource for getting health data
# class GetHealthData(Resource):
#     @token_required
#     def get(account_id, self, patient_id):
#         connection = None
#         try:
#             start_time = datetime.now()
#             connection = get_test()

#             sql_select_query = """
#             SELECT patient_id, blood_pressure, sugar_level, cholesterol, created_at 
#             FROM health_data WHERE tenant_id=%s AND patient_id=%s
#             """
#             df = pd.read_sql_query(sql_select_query, connection, params=(account_id["tenant_id"], patient_id))
            
#             data_json = df.to_json(orient='records')
#             data = json.loads(data_json)
            
#             put_test(connection)
#             end_time = datetime.now()
#             time_taken = end_time - start_time
            
#             return make_response(jsonify({"status": "success", "data": data}), 200)

#         except Exception as e:
#             return handle_database_error(e, connection)

# # Resource for getting prescriptions
# class GetPrescriptions(Resource):
#     @token_required
#     def get(account_id, self, patient_id):
#         connection = None
#         try:
#             start_time = datetime.now()
#             connection = get_test()

#             sql_select_query = """
#             SELECT prescription_id, patient_id, doctor_name, medications, dosage, created_at 
#             FROM prescriptions WHERE tenant_id=%s AND patient_id=%s
#             """
#             df = pd.read_sql_query(sql_select_query, connection, params=(account_id["tenant_id"], patient_id))
            
#             data_json = df.to_json(orient='records')
#             data = json.loads(data_json)
            
#             put_test(connection)
#             end_time = datetime.now()
#             time_taken = end_time - start_time
            
#             return make_response(jsonify({"status": "success", "data": data}), 200)

#         except Exception as e:
#             return handle_database_error(e, connection)

# # Resource for getting bills
# class GetBills(Resource):
#     @token_required
#     def get(account_id, self, patient_id):
#         connection = None
#         try:
#             start_time = datetime.now()
#             connection = get_test()

#             sql_select_query = """
#             SELECT bill_id, patient_id, total_amount, paid_amount, created_at 
#             FROM bills WHERE tenant_id=%s AND patient_id=%s
#             """
#             df = pd.read_sql_query(sql_select_query, connection, params=(account_id["tenant_id"], patient_id))
            
#             data_json = df.to_json(orient='records')
#             data = json.loads(data_json)
            
#             put_test(connection)
#             end_time = datetime.now()
#             time_taken = end_time - start_time
            
#             return make_response(jsonify({"status": "success", "data": data}), 200)

#         except Exception as e:
#             return handle_database_error(e, connection)

# # Adding resources to the API endpoints
# api.add_resource(GetPatientDetails, "/api/patient/details/<int:patient_id>")
# api.add_resource(GetHealthData, "/api/patient/healthdata/<int:patient_id>")
# api.add_resource(GetPrescriptions, "/api/patient/prescriptions/<int:patient_id>")
# api.add_resource(GetBills, "/api/patient/bills/<int:patient_id>")
from flask import Blueprint, request, jsonify, make_response
from flask_restful import Api, Resource
from datetime import datetime
import json
from loguru import logger

# Blueprint and API setup
patientdetails = Blueprint("patientdetails", __name__)
api = Api(patientdetails)

# Mock data for patient details, health data, prescriptions, and bills
mock_patient_details = {
    "id": 11,
    "patient_no": "P12345",
    "name": "John Doe",
    "phone_number": "123-456-7890",
    "dob": "1978-05-21",
    "gender": "Male",
    "doctor": "Dr. Sarah Thompson", 
  "admission_date": "2024-10-11T09:30:00", 
}

mock_health_data = [
    {
        "visit_day": "2024-01-05",
        "doctor": "Dr. Smith",
        "blood_pressure": 130,
        "blood_sugar": 90,
        "heart_rate": 75,
        "spo2": 98,
        "temperature": 98.6,
        "diagnosis": "Headache"
    },
    {
        "visit_day": "2024-01-10",
        "doctor": "Dr. Johnson",
        "blood_pressure": 135,
        "blood_sugar": 95,
        "heart_rate": 80,
        "spo2": 97,
        "temperature": 99.1,
        "diagnosis": "High Fever"
    },
    {
        "visit_day": "2024-01-15",
        "doctor": "Dr. Patel",
        "blood_pressure": 140,
        "blood_sugar": 100,
        "heart_rate": 78,
        "spo2": 96,
        "temperature": 100.4,
        "diagnosis": "Migrane"
    }
]

mock_prescriptions = [
    {
        "prescription_id": 1,
        "patient_id": 3,
        "doctor_name": "Dr. Smith",
        "diagnosis": "Hypertension",
        "medications": [
            {
                "name": "Amlodipine",
                "quantity": 6,  # Total tablets given
                "timings": [1, 0, 1],  # Morning and Night
                "food": "before food"  # Renamed field
            },
            {
                "name": "Metformin",
                "quantity": 3,  # Total tablets given
                "timings": [0, 1, 0],  # Afternoon only
                "food": "after food"  # Renamed field
            }
        ],
        "service": "Blood Pressure Monitoring",
        "instruction": "Take both medications with water, avoid grapefruit while taking Amlodipine.",
        "created_at": "2023-12-15",
    },
    {
        "prescription_id": 2,
        "patient_id": 3,
        "doctor_name": "Dr. Smith",
        "diagnosis": "High Blood Pressure",
        "medications": [
            {
                "name": "Lisinopril",
                "quantity": 6,  # Total tablets given
                "timings": [0, 0, 1],  # Night only
                "food": "before food"  # Renamed field
            }
        ],
        "service": "Routine Check-up",
        "instruction": "Take this medication at the same time each day, monitor blood pressure regularly.",
        "created_at": "2023-11-10",
    },
]


mock_bills = [
    {
        "bill_id": 1,
        "patient_id": 3,
        "total_amount": "500",
        "created_at": "2023-12-15",
    },
    {
        "bill_id": 2,
        "patient_id": 3,
        "total_amount": "300",
        "created_at": "2023-11-10",
    },
]

# Resource for getting patient details
class GetPatientDetails(Resource):
    def get(self, patient_id):
        try:
            # Mock data retrieval
            if patient_id == 11:
                data = mock_patient_details
            else:
                data = {}
            return make_response(jsonify({"status": "success", "data": data}), 200)
        except Exception as e:
            return handle_database_error(e, None)

# Resource for getting health data
class GetHealthData(Resource):
    def get(self, patient_id):
        try:
            # Mock data retrieval
            if patient_id == 11:
                data = mock_health_data
            else:
                data = []
            return make_response(jsonify({"status": "success", "data": data}), 200)
        except Exception as e:
            return handle_database_error(e, None)

# Resource for getting prescriptions
class GetPrescriptions(Resource):
    def get(self, patient_id):
        try:
            # Mock data retrieval
            if patient_id == 11:
                data = mock_prescriptions
            else:
                data = []
            return make_response(jsonify({"status": "success", "data": data}), 200)
        except Exception as e:
            return handle_database_error(e, None)

# Resource for getting bills
class GetBills(Resource):
    def get(self, patient_id):
        try:
            # Mock data retrieval
            if patient_id == 11:
                data = mock_bills
            else:
                data = []
            return make_response(jsonify({"status": "success", "data": data}), 200)
        except Exception as e:
            return handle_database_error(e, None)

# Adding resources to the API endpoints
api.add_resource(GetPatientDetails, "/api/patient/details/<int:patient_id>")
api.add_resource(GetHealthData, "/api/patient/healthdata/<int:patient_id>")
api.add_resource(GetPrescriptions, "/api/patient/prescriptions/<int:patient_id>")
api.add_resource(GetBills, "/api/patient/bills/<int:patient_id>")

# Helper function to handle errors (unchanged)
def handle_database_error(e, connection):
    logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
    logger.error(f"Exception: {str(e)}")
    return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)
