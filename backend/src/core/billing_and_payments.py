from flask import Blueprint, request, jsonify, make_response
from flask_restful import Api, Resource
from datetime import datetime
import pandas as pd
import json
from src.config import get_test, put_test
from ..decode.user_decode import token_required
from loguru import logger

billing_bp = Blueprint("billing", __name__)
api = Api(billing_bp)

class AddBillingRecord(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            cursor = connection.cursor()

            # Filter out medicines with a quantity of 0
            medicines = [med for med in value.get("medicines", []) if med.get("quantity", 0) > 0]

            # Insert billing record
            insert_query = """
            INSERT INTO billing(patient_name, phone_number, date, status, discount, subtotal, cgst, sgst, total, last_updated, medicines, tenant_id, age_year, age_month, gender, ip_no)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            """
            record_to_insert = (
                value.get("patientName", ""), value.get("phoneNumber", ""), value.get("date", ""), value.get("status", ""),
                value.get("discount", 0.00), value.get("subtotal", 0.00), value.get("cgst", 0.00), value.get("sgst", 0.00),
                value.get("total", 0.00), start_time, json.dumps(medicines), account_id.get('tenant_id', ""),
                value.get("ageYear", 0), value.get("ageMonth", 0), value.get("gender", ""), value.get("ipNo", "")
            )
            cursor.execute(insert_query, record_to_insert)
            billing_id = cursor.fetchone()[0]

            # Update quantities in medicines table
            for medicine in medicines:
                update_medicine_query = """
                UPDATE medicines
                SET quantity = quantity - %s
                WHERE id = %s AND quantity >= %s
                RETURNING quantity
                """
                cursor.execute(update_medicine_query, (medicine["quantity"], medicine["value"], medicine["quantity"]))
                if cursor.rowcount == 0:
                    raise Exception(f"Insufficient quantity for medicine ID {medicine['value']}")

            # Commit the transaction
            connection.commit()

            put_test(connection)
            return make_response(jsonify({"status": "success", "message": "Billing record added", "data": {"id": billing_id}}), 200)
        except Exception as e:
            if connection:
                connection.rollback()
            logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
            logger.error(f"Exception: {str(e)}")
            return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

api.add_resource(AddBillingRecord, "/api/billing/add")


class EditBillingRecord(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            billing_id = value["id"]
            cursor = connection.cursor()

            # Get the original billing record
            cursor.execute("SELECT medicines FROM billing WHERE id=%s", (billing_id,))
            original_record = cursor.fetchone()
            original_medicines = original_record[0]
            
            # Reverse the quantity deduction for original medicines
            for medicine in original_medicines:
                update_medicine_query = """
                UPDATE medicines
                SET quantity = quantity + %s
                WHERE id = %s
                """
                cursor.execute(update_medicine_query, (medicine["quantity"], medicine["value"]))

            # Filter out medicines with zero quantity
            updated_medicines = [med for med in value.get("medicines", []) if med.get("quantity", 0) > 0]

            # Update the billing record
            update_query = """
            UPDATE billing SET patient_name=%s, phone_number=%s, date=%s, status=%s, discount=%s, subtotal=%s, cgst=%s, sgst=%s, total=%s, last_updated=%s, medicines=%s, tenant_id=%s, age_year=%s, age_month=%s, gender=%s, ip_no=%s
            WHERE id=%s
            """
            record_to_update = (
                value.get("patientName", ""), value.get("phoneNumber", ""), value.get("date", ""), value.get("status", ""),
                value.get("discount", 0.00), value.get("subtotal", 0.00), value.get("cgst", 0.00), value.get("sgst", 0.00),
                value.get("total", 0.00), start_time, json.dumps(updated_medicines), account_id.get('tenant_id', ""),
                value.get("ageYear", 0), value.get("ageMonth", 0), value.get("gender", ""), value.get("ipNo", ""), billing_id
            )
            cursor.execute(update_query, record_to_update)

            # Deduct the quantity for the new medicines
            for medicine in updated_medicines:
                update_medicine_query = """
                UPDATE medicines
                SET quantity = quantity - %s
                WHERE id = %s AND quantity >= %s
                RETURNING quantity
                """
                cursor.execute(update_medicine_query, (medicine["quantity"], medicine["value"], medicine["quantity"]))
                if cursor.rowcount == 0:
                    raise Exception(f"Insufficient quantity for medicine ID {medicine['value']}")

            # Commit the transaction
            connection.commit()

            put_test(connection)
            return make_response(jsonify({"status": "success", "message": "Billing record updated", "data": ""}), 200)
        except Exception as e:
            if connection:
                connection.rollback()
            logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
            logger.error(f"Exception: {str(e)}")
            return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

api.add_resource(EditBillingRecord, "/api/billing/edit")


class DeleteBillingRecord(Resource):
    @token_required
    def post(account_id, self):
        connection = None
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            billing_id = value["id"]
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM billing WHERE id=%s", (billing_id,))
                connection.commit()
            put_test(connection)
            return make_response(jsonify({"status": "success", "message": "Billing record deleted", "data": ""}), 200)
        except Exception as e:
            logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
            logger.error(f"Exception: {str(e)}")
            if connection:
                put_test(connection)
            return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

api.add_resource(DeleteBillingRecord, "/api/billing/delete")

class GetBillingRecords(Resource):
    @token_required
    def get(account_id, self):
        connection = None
        try:
            connection = get_test()
            
            sql_select_query = """
            SELECT id, patient_name, phone_number, date, status, discount, subtotal, cgst, sgst, total, last_updated, medicines, tenant_id, age_year, age_month, gender, ip_no FROM billing
            WHERE tenant_id=%s
            """
            df = pd.read_sql_query(sql_select_query, connection, params=[account_id['tenant_id']])
            data_json = df.to_json(orient='records')
            data = json.loads(data_json)
            put_test(connection)
            
            return make_response(jsonify({"status": "success", "data": data}), 200)
        except Exception as e:
            logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
            logger.error(f"Exception: {str(e)}")
            if connection:
                put_test(connection)
            return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)


api.add_resource(GetBillingRecords, "/api/billing/get")

class GetPatientName(Resource):
    @token_required
    def post(account_id, self):
        try:
            phone_number = request.json.get('phone_number')
            if not phone_number:
                return make_response(jsonify({"status": "error", "message": "Phone number is required"}), 400)

            connection = get_test()
            
            sql_select_query = """
            SELECT patient_name FROM billing
            WHERE tenant_id=%s AND phone_number=%s
            """
            df = pd.read_sql_query(sql_select_query, connection, params=[account_id['tenant_id'], phone_number])
            data_json = df.to_json(orient='records')
            data = json.loads(data_json)
            put_test(connection)
            
            return make_response(jsonify({"status": "success", "data": data}), 200)
        except Exception as e:
            logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
            logger.error(f"Exception: {str(e)}")
            if connection:
                put_test(connection)
            return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

# Register the new resource with your API
api.add_resource(GetPatientName, "/api/billing/getpatientname")
