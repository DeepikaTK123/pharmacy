import io
import os
import re
import sys
from flask import Blueprint, request, jsonify, make_response
from flask_restful import Api, Resource
from datetime import datetime
import pandas as pd
from src.config import get_test, put_test
from ..decode.user_decode import token_required
import json
import fitz  # PyMuPDF
import pytesseract
from PIL import Image

from loguru import logger

# Blueprint and API setup
suppliers = Blueprint("suppliers", __name__)
api = Api(suppliers)

# Helper function to handle database errors and response
def handle_database_error(e, connection):
    logger.error(f"Error in line: {e.__traceback__.tb_lineno}")
    logger.error(f"Exception: {str(e)}")
    if connection:
        put_test(connection)
    return make_response(jsonify({"status": "error", "message": str(e), "data": {}}), 500)

# Resource for adding a new supplier
class AddSupplier(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json

            insert_query = """
            INSERT INTO suppliers(name, contact_number, address, email, tenant_id)
            VALUES (%s, %s, %s, %s, %s)
            """
            record_to_insert = (
                value["name"], value["contactNumber"], value["address"], value["email"], account_id['tenant_id']
            )

            with connection.cursor() as cursor:
                cursor.execute(insert_query, record_to_insert)
                connection.commit()
            
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            
            return make_response(jsonify({"status": "success", "message": "Added New Supplier", "data": {}}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

# Resource for editing an existing supplier
class EditSupplier(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            supplier_id = value["id"]

            update_fields = {
                "name": value["name"],
                "contact_number": value["contactNumber"],
                "address": value["address"],
                "email": value["email"]
            }
            update_query = "UPDATE suppliers SET {} WHERE id=%s AND tenant_id=%s".format(
                            ", ".join("{}=%s".format(k) for k in update_fields.keys())
                        )
            with connection.cursor() as cursor:
                cursor.execute(update_query, list(update_fields.values()) + [supplier_id, account_id['tenant_id']])
                connection.commit()
            
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            
            return make_response(jsonify({"status": "success", "message": "Updated Successfully", "data": ""}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

# Resource for deleting a supplier
class DeleteSupplier(Resource):
    @token_required
    def post(account_id, self):
        try:
            start_time = datetime.now()
            connection = get_test()
            value = request.json
            supplier_id = value["id"]

            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM suppliers WHERE id=%s AND tenant_id=%s", (supplier_id, account_id['tenant_id']))
                connection.commit()
            
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            
            return make_response(jsonify({"status": "success", "message": "Deleted Successfully", "data": ""}), 200)

        except Exception as e:
            return handle_database_error(e, connection)

# Resource for retrieving all suppliers
class GetSuppliers(Resource):
    @token_required
    def get(account_id, self):
        connection = None
        try:
            start_time = datetime.now()
            connection = get_test()
            sql_select_query = """
            SELECT id, name, contact_number, address, email FROM suppliers WHERE tenant_id=%s ORDER BY name ASC
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

# Resource for uploading an invoice
class UploadInvoice(Resource):
    @token_required
    def post(account_id, self):
        connection = None
        file_path = None
        try:
            start_time = datetime.now()
            connection = get_test()
            if 'file' not in request.files:
                return make_response(jsonify({"status": "error", "message": "No file part"}), 400)
            file = request.files['file']
            if file.filename == '':
                return make_response(jsonify({"status": "error", "message": "No selected file"}), 400)

            # Save the file temporarily
            file_path = os.path.join(os.path.dirname(__file__), file.filename)
            file.save(file_path)

            # Extract text from the PDF
         
            # Delete the temporary file
            os.remove(file_path)

            # Add logic to save extracted text to the database if needed
            
            put_test(connection)
            end_time = datetime.now()
            time_taken = end_time - start_time
            
            return make_response(jsonify({"status": "success", "message": "File uploaded and text extracted successfully", "data": "invoice_fields"}), 200)

        except Exception as e:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
            return handle_database_error(e, connection)
        
# Adding resources to the API endpoints
api.add_resource(AddSupplier, "/api/suppliers/add")
api.add_resource(EditSupplier, "/api/suppliers/edit")
api.add_resource(DeleteSupplier, "/api/suppliers/delete")
api.add_resource(GetSuppliers, "/api/suppliers/get")
api.add_resource(UploadInvoice, "/api/invoices/upload")
