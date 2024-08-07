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
            items = [item for item in value.get("items", []) if item.get("quantity", 0) > 0]

            cursor.execute("SELECT id FROM patients WHERE phone_number=%s and tenant_id=%s", (value.get("phoneNumber", ""), account_id["tenant_id"]))
            patient_id = cursor.fetchone()
            
            if not patient_id:
                insert_patient_query = """
                INSERT INTO patients(tenant_id, patient_no, name, phone_number, dob, gender, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
                """
                patient_record_to_insert = (
                    account_id["tenant_id"], value.get("patientNumber", ""), value.get("patientName", ""), value.get("phoneNumber", ""), value.get("dob", ""),
                    value.get("gender", ""), start_time, start_time
                )
                cursor.execute(insert_patient_query, patient_record_to_insert)
                patient_id = cursor.fetchone()[0]
            else:
                patient_id = patient_id[0]

            insert_query = """
            INSERT INTO billing(patient_name, phone_number, dob, date, status, discount, subtotal, cgst, sgst, total, last_updated, items, tenant_id, age_year, age_month, gender, patient_number)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            """
            record_to_insert = (
                value.get("patientName", ""), value.get("phoneNumber", ""), value.get("dob", ""), value.get("date", ""), 
                value.get("status", ""), value.get("discount", 0.00), value.get("subtotal", 0.00), value.get("cgst", 0.00), 
                value.get("sgst", 0.00), value.get("total", 0.00), start_time, json.dumps(items), account_id.get('tenant_id', ""),
                value.get("ageYear", 0), value.get("ageMonth", 0), value.get("gender", ""), value.get("patientNumber", "")
            )
            cursor.execute(insert_query, record_to_insert)
            billing_id = cursor.fetchone()[0]

            # Update quantities in medicines table
            for item in items:
                if item['type'] == 'medicine':
                    update_medicine_query = """
                    UPDATE medicines
                    SET quantity = quantity - %s
                    WHERE id = %s AND quantity >= %s AND tenant_id=%s
                    RETURNING quantity
                    """
                    cursor.execute(update_medicine_query, (item["quantity"], item["value"], item["quantity"], account_id["tenant_id"]))
                    if cursor.rowcount == 0:
                        raise Exception(f"Insufficient quantity for medicine ID {item['value']}")

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

class EditBillingRecord(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            billing_id = value["id"]
            cursor = connection.cursor()
            print(value)
            # Get the original billing record
            cursor.execute("SELECT items FROM billing WHERE id=%s", (billing_id,))
            original_record = cursor.fetchone()
            original_items = original_record[0]

            # Reverse the quantity deduction for original medicines
            for item in original_items:
                if item['type'] == 'medicine':
                    update_medicine_query = """
                    UPDATE medicines
                    SET quantity = quantity + %s
                    WHERE id = %s
                    """
                    cursor.execute(update_medicine_query, (item["quantity"], item["value"]))

            # Filter out items with zero quantity
            updated_items = [item for item in value.get("items", []) if item.get("quantity", 0) > 0]

            # Update the patient record
            update_patient_query = """
            UPDATE patients SET patient_no=%s, name=%s, phone_number=%s, dob=%s, gender=%s, updated_at=%s
            WHERE phone_number=%s AND tenant_id=%s
            """
            patient_record_to_update = (
                value.get("patientNumber", ""), value.get("patientName", ""), value.get("phoneNumber", ""), value.get("dob", ""),
                value.get("gender", ""), start_time, value.get("phoneNumber", ""), account_id["tenant_id"]
            )
            cursor.execute(update_patient_query, patient_record_to_update)

            # Update the billing record
            update_query = """
            UPDATE billing SET patient_name=%s, phone_number=%s, dob=%s, date=%s, status=%s, discount=%s, subtotal=%s, cgst=%s, sgst=%s, total=%s, last_updated=%s, items=%s, tenant_id=%s, age_year=%s, age_month=%s, gender=%s, patient_number=%s
            WHERE id=%s
            """
            record_to_update = (
                value.get("patientName", ""), value.get("phoneNumber", ""), value.get("dob", ""), value.get("date", ""), 
                value.get("status", ""), value.get("discount", 0.00), value.get("subtotal", 0.00), value.get("cgst", 0.00), 
                value.get("sgst", 0.00), value.get("total", 0.00), start_time, json.dumps(updated_items), account_id.get('tenant_id', ""),
                value.get("ageYear", 0), value.get("ageMonth", 0), value.get("gender", ""), value.get("patientNumber", ""), billing_id
            )
            cursor.execute(update_query, record_to_update)

            # Deduct the quantity for the new medicines
            for item in updated_items:
                if item['type'] == 'medicine':
                    update_medicine_query = """
                    UPDATE medicines
                    SET quantity = quantity - %s
                    WHERE id = %s AND quantity >= %s
                    RETURNING quantity
                    """
                    cursor.execute(update_medicine_query, (item["quantity"], item["value"], item["quantity"]))
                    if cursor.rowcount == 0:
                        raise Exception(f"Insufficient quantity for medicine ID {item['value']}")

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


class DeleteBillingRecord(Resource):
    @token_required
    def post(account_id, self):
        connection = None
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            print(value)
            billing_id = value["id"]
            cursor = connection.cursor()

            # Get the original billing record
            cursor.execute("SELECT items FROM billing WHERE id=%s", (billing_id,))
            original_record = cursor.fetchone()
            original_items = original_record[0]

            # Reverse the quantity deduction for original medicines
            for item in original_items:
                if item['type'] == 'medicine':
                    update_medicine_query = """
                    UPDATE medicines
                    SET quantity = quantity + %s
                    WHERE id = %s
                    """
                    cursor.execute(update_medicine_query, (item["quantity"], item["value"]))

            # Delete the billing record
            cursor.execute("DELETE FROM billing WHERE id=%s", (billing_id,))
            connection.commit()
            
            put_test(connection)
            return make_response(jsonify({"status": "success", "message": "Billing record deleted", "data": ""}), 200)
        except Exception as e:
            if connection:
                connection.rollback()
            logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
            logger.error(f"Exception: {str(e)}")
            if connection:
                put_test(connection)
            return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

class GetBillingRecords(Resource):
    @token_required
    def get(account_id, self):
        connection = None
        try:
            connection = get_test()
            
            sql_select_query = """
            SELECT id, patient_name, phone_number, dob, date, status, discount, subtotal, cgst, sgst, total, last_updated, items, tenant_id, age_year, age_month, gender, patient_number FROM billing 
            WHERE tenant_id=%s order by id desc
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

class GetPatientName(Resource):
    @token_required
    def post(account_id, self):
        try:
            phone_number = request.json.get('phone_number')
            if not phone_number:
                return make_response(jsonify({"status": "error", "message": "Phone number is required"}), 400)

            connection = get_test()
            
            sql_select_query = """
            SELECT id, patient_no, name, phone_number, dob, gender FROM patients
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

# Register the new resources with your API
api.add_resource(AddBillingRecord, "/api/billing/add")
api.add_resource(EditBillingRecord, "/api/billing/edit")
api.add_resource(DeleteBillingRecord, "/api/billing/delete")
api.add_resource(GetBillingRecords, "/api/billing/get")
api.add_resource(GetPatientName, "/api/billing/getpatientname")
