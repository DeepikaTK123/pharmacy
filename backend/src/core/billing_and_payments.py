import sys
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

            # Insert or fetch patient record
            cursor.execute("SELECT id FROM patients WHERE phone_number=%s and tenant_id=%s", 
                           (value.get("phoneNumber", ""), account_id["tenant_id"]))
            patient_id = cursor.fetchone()
            if not value["patientNumber"]:
                value["patientNumber"]= value["phoneNumber"]
            if not patient_id:

                insert_patient_query = """
                INSERT INTO patients(tenant_id,doctor_name, patient_no, name, phone_number, dob, gender, created_at, updated_at)
                VALUES (%s, %s, %s,%s, %s, %s, %s, %s, %s) RETURNING id
                """
                patient_record_to_insert = (
                    account_id["tenant_id"],value.get("doctor_name", ""), value.get("patientNumber", ""), value.get("patientName", ""), 
                    value.get("phoneNumber", ""), value.get("dob", ""), value.get("gender", ""), start_time, start_time
                )
                cursor.execute(insert_patient_query, patient_record_to_insert)
                patient_id = cursor.fetchone()[0]
            else:
                patient_id = patient_id[0]

            # Insert billing record
            
            
            insert_query = """
            INSERT INTO billing(patient_name, phone_number, dob, date, status, discount, subtotal, cgst, sgst, total, 
            last_updated, tenant_id, age_year, age_month, gender, patient_number,patient_id)
            VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            """
            record_to_insert = (
                value.get("patientName", ""), value.get("phoneNumber", ""), value.get("dob", ""), value.get("date", ""), 
                value.get("status", ""), value.get("discount", 0.00), value.get("subtotal", 0.00), value.get("cgst", 0.00), 
                value.get("sgst", 0.00), value.get("total", 0.00), start_time, account_id.get('tenant_id', ""), 
                value.get("ageYear", 0), value.get("ageMonth", 0), value.get("gender", ""), value.get("patientNumber", value["phoneNumber"]),patient_id
            )
            cursor.execute(insert_query, record_to_insert)
            billing_id = cursor.fetchone()[0]

            # Insert each item into billing_items
            for item in items:
                insert_item_query = """
                INSERT INTO billing_items (billing_id, item_type, label, price, total, quantity, batch_no, expiry_date, 
                manufactured_by, rate, cgst, sgst, item_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                item_values = (
                    billing_id, item['type'], item['label'], item['price'], item['total'], item['quantity'], 
                    item.get('batchNo'), item.get('expiryDate'), item.get('manufacturedBy'), item.get('rate'), 
                    item.get('cgst', 0), item.get('sgst', 0), item.get('item_id')  # Include item_id here
                )
                cursor.execute(insert_item_query, item_values)


                # Update quantities in medicines table
                if item['type'] == 'medicine':
                    update_medicine_query = """
                    UPDATE medicines SET quantity = quantity - %s
                    WHERE id = %s AND quantity >= %s AND tenant_id = %s
                    RETURNING quantity
                    """
                    cursor.execute(update_medicine_query, (item["quantity"], item["value"], item["quantity"], account_id["tenant_id"]))
                    if cursor.rowcount == 0:
                        raise Exception(f"Insufficient quantity for medicine ID {item['value']}")

            # Commit transaction
            connection.commit()
            put_test(connection)

            return make_response(jsonify({"status": "success", "message": "Billing record added", "data": {"id": billing_id}}), 200)

        except Exception as e:
            if connection:
                connection.rollback()
            logger.error(f"Error: {str(e)}")
            return make_response(jsonify({"status": "error", "message": str(e)}), 500)

class EditBillingRecord(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            billing_id = value["id"]
            cursor = connection.cursor()

            # Get original billing items
            cursor.execute("SELECT id, item_type, quantity FROM billing_items WHERE billing_id = %s", (billing_id,))
            original_items = cursor.fetchall()

            # Reverse quantity changes for original medicines
            for item in original_items:
                if item[1] == 'medicine':
                    update_medicine_query = """
                    UPDATE medicines SET quantity = quantity + %s WHERE id = %s AND tenant_id = %s
                    """
                    cursor.execute(update_medicine_query, (item[2], item[0], account_id["tenant_id"]))

            # Update billing record
            update_query = """
            UPDATE billing SET patient_name=%s, phone_number=%s, dob=%s, date=%s, status=%s, discount=%s, subtotal=%s, 
            cgst=%s, sgst=%s, total=%s, last_updated=%s, tenant_id=%s, age_year=%s, age_month=%s, gender=%s, 
            patient_number=%s WHERE id=%s
            """
            record_to_update = (
                value.get("patientName", ""), value.get("phoneNumber", ""), value.get("dob", ""), value.get("date", ""), 
                value.get("status", ""), value.get("discount", 0.00), value.get("subtotal", 0.00), value.get("cgst", 0.00), 
                value.get("sgst", 0.00), value.get("total", 0.00), start_time, account_id.get('tenant_id', ""), 
                value.get("ageYear", 0), value.get("ageMonth", 0), value.get("gender", ""), value.get("patientNumber", ""), billing_id
            )
            cursor.execute(update_query, record_to_update)

            # Delete existing billing items
            cursor.execute("DELETE FROM billing_items WHERE billing_id = %s", (billing_id,))

            # Insert updated items into billing_items
            for item in value.get("items", []):
                insert_item_query = """
                INSERT INTO billing_items (billing_id, item_type, label, price, total, quantity, batch_no, expiry_date, 
                manufactured_by, rate, cgst, sgst, item_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                item_values = (
                    billing_id, item['type'], item['label'], item['price'], item['total'], item['quantity'], 
                    item.get('batchNo'), item.get('expiryDate') if item.get('expiryDate') else None, item.get('manufacturedBy'), item.get('rate'), 
                    item.get('cgst', 0), item.get('sgst', 0), item.get('item_id')  # Include item_id here
                )
                cursor.execute(insert_item_query, item_values)

                # Deduct the updated quantities for medicines
                if item['type'] == 'medicine':
                    update_medicine_query = """
                    UPDATE medicines SET quantity = %s WHERE id = %s  AND tenant_id = %s
                    """
                    cursor.execute(update_medicine_query, (item["quantityAvailable"], item["item_id"], account_id["tenant_id"]))
                    if cursor.rowcount == 0:
                        raise Exception(f"Insufficient quantity for medicine ID {item['item_id']}")

            # Commit the transaction
            connection.commit()
            put_test(connection)

            return make_response(jsonify({"status": "success", "message": "Billing record updated"}), 200)

        except Exception as e:
            if connection:
                connection.rollback()
            exception_type, exception_object, exception_traceback = sys.exc_info()
            line_number = exception_traceback.tb_lineno
            logger.error("Error in line: " + str(line_number))
            logger.error(f"Error: {str(e)}")
            return make_response(jsonify({"status": "error", "message": str(e)}), 500)


class DeleteBillingRecord(Resource):
    @token_required
    def post(account_id, self):
        try:
            connection = get_test()
            value = request.json
            billing_id = value["id"]
            cursor = connection.cursor()

            # Get original billing items
            cursor.execute("SELECT id, item_type, quantity FROM billing_items WHERE billing_id = %s", (billing_id,))
            original_items = cursor.fetchall()

            # Reverse the quantity deduction for original medicines
            for item in original_items:
                if item[1] == 'medicine':
                    update_medicine_query = """
                    UPDATE medicines SET quantity = quantity + %s WHERE id = %s AND tenant_id = %s
                    """
                    cursor.execute(update_medicine_query, (item[2], item[0], account_id["tenant_id"]))

            # Delete the billing record
            cursor.execute("DELETE FROM billing WHERE id=%s", (billing_id,))
            cursor.execute("DELETE FROM billing_items WHERE billing_id=%s", (billing_id,))
            connection.commit()

            put_test(connection)
            return make_response(jsonify({"status": "success", "message": "Billing record deleted"}), 200)

        except Exception as e:
            if connection:
                connection.rollback()
            logger.error(f"Error: {str(e)}")
            return make_response(jsonify({"status": "error", "message": str(e)}), 500)

class GetBillingRecords(Resource):
    @token_required
    def get(account_id, self):
        try:
            connection = get_test()
            sql_select_query = """
           SELECT 
            b.id AS id, 
            b.patient_name, 
            b.phone_number, 
            b.date, 
            b.status, 
            b.subtotal, 
            b.total, 
            b.discount,
            json_agg(
                json_build_object(
                    'item_type', bi.item_type, 
                    'label', bi.label, 
                    'price', bi.price, 
                    'total', bi.total, 
                    'quantity', bi.quantity, 
                    'batch_no', bi.batch_no, 
                    'expiry_date', bi.expiry_date, 
                    'manufactured_by', bi.manufactured_by, 
                    'cgst', bi.cgst, 
                    'sgst', bi.sgst,
                    'item_id', bi.item_id  
                )
            ) AS billing_items
        FROM 
            billing b
        JOIN 
            billing_items bi 
        ON 
            b.id = bi.billing_id
        WHERE 
            b.tenant_id = %s  -- Replace with your specific tenant_id
        GROUP BY 
            b.id
        ORDER BY 
            b.id DESC;  -- Ordering by billing_id in descending order

            """
            df = pd.read_sql_query(sql_select_query, connection, params=[account_id['tenant_id']])
            data_json = df.to_json(orient='records')
            data = json.loads(data_json)
            # Get items for each billing record
            # billing_ids = tuple(df_billing['id'].tolist())
            # sql_items_query = """
            # SELECT billing_id, item_type, label, price, total, quantity, batch_no, expiry_date, manufactured_by, rate, cgst, sgst 
            # FROM billing_items WHERE billing_id IN %s
            # """
            # # if not billing_ids:
            # #     return make_response(jsonify({"status": "success", "data": []}), 200)

            # df_items = pd.read_sql_query(sql_items_query, connection, params=[billing_ids])

            # # Combine the results
            # data = df_billing.to_dict(orient='records') 
            # for billing in data:
            #     billing_id = billing['id']
                
            #     # Check if there are items for this billing_id
            #     matching_items = df_items[df_items['billing_id'] == billing_id]
            #     if not matching_items.empty:
            #         # Convert to dict if there are matching items
            #         billing['items'] = matching_items.to_dict(orient='records')
            #     else:
            #         # Assign an empty list if no items are found
            #         billing['items'] = []

            put_test(connection)
            
            # Return as JSON, not as a string
            return make_response(jsonify({"status": "success", "data": data}), 200)

        except Exception as e:
            logger.error(f"Error: {str(e)}")
            if connection:
                put_test(connection)
            return make_response(jsonify({"status": "error", "message": str(e)}), 500)


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
