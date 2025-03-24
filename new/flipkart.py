import os
import pandas as pd
import requests
from PyQt6.QtWidgets import QApplication, QMainWindow, QLabel, QLineEdit, QPushButton, QFileDialog, QProgressBar
from PyQt6.QtGui import QFont
import logging
import threading
from concurrent.futures import ThreadPoolExecutor


import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("api_logger")
file_handler = logging.FileHandler("logfile.log")
file_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

cookie_key = ""
parent_folder_id = 4  

class MigrationApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Bulk File Uploader")
        self.setGeometry(400, 200, 600, 500)
        self.setup_ui()
        self.migration_path = ""
        self.excel_path = ""

    def setup_ui(self):
        self.label = QLabel("Choose folder path", self)
        self.label.setGeometry(150, 50, 220, 30)
        self.label.setFont(QFont("Arial", 12))

        self.line_edit = QLineEdit(self)
        self.line_edit.setGeometry(100, 80, 240, 30)

        self.select_button = QPushButton("Select Folder", self)
        self.select_button.setGeometry(350, 80, 120, 30)
        self.select_button.clicked.connect(self.browse_folder)

        self.label_excel = QLabel("Choose Excel file", self)
        self.label_excel.setGeometry(150, 130, 220, 30)
        self.label_excel.setFont(QFont("Arial", 12))

        self.excel_edit = QLineEdit(self)
        self.excel_edit.setGeometry(100, 160, 240, 30)

        self.select_excel_button = QPushButton("Select Excel", self)
        self.select_excel_button.setGeometry(350, 160, 120, 30)
        self.select_excel_button.clicked.connect(self.browse_excel)

        self.upload_button = QPushButton("Upload Files", self)
        self.upload_button.setGeometry(180, 210, 140, 40)
        self.upload_button.clicked.connect(self.start_migration)

        self.progress_bar = QProgressBar(self)
        self.progress_bar.setGeometry(100, 260, 350, 30)
        self.progress_bar.setValue(0)

        self.uploaded_label = QLabel("Uploaded: 0", self)
        self.uploaded_label.setGeometry(100, 300, 200, 30)

        self.failed_label = QLabel("Failed: 0", self)
        self.failed_label.setGeometry(100, 340, 200, 30)

    def browse_folder(self):
        folder_path = QFileDialog.getExistingDirectory(self, "Select a folder")
        if folder_path:
            self.migration_path = folder_path
            self.line_edit.setText(folder_path)

    def browse_excel(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Select Excel File", "", "Excel Files (*.xlsx *.xls)")
        if file_path:
            self.excel_path = file_path
            self.excel_edit.setText(file_path)

    def start_migration(self):
        if not self.migration_path or not self.excel_path:
            self.show_error_box("Please select both folder and Excel file before uploading!")
            return
        
        session = requests.Session()
        login_url = "https://dmsstage.wepdigital.com/server/user/api/v7/auth/login.json"
        payload = {"loginName": "company.admin", "password": "wepsol@789"}
        response = session.post(login_url, data=payload, verify=False)

        if response.status_code == 200 and response.cookies:
            global cookie_key
            cookie_key = response.cookies.values()[0]
            logger.info("Login successful!")
        else:
            self.show_error_box("Login failed! Check credentials or internet connection.")
            return

        self.process_employee_folders(session)

    def create_folder(self, session, folder_name, parent_id=parent_folder_id):
        create_folder_url = "https://dmsstage.wepdigital.com/server/user/api/v7/department/folder/add.json"
        payload = {"departmentId": 4, "parentId": parent_id, "name": folder_name}
        headers = {"Cookie": f"_app_vis_id_={cookie_key}"}
        
        response = session.post(create_folder_url, data=payload, headers=headers)
        logger.info(f"Creating folder: {folder_name}, Status Code: {response.status_code}, Response: {response.text}")
        
        try:
            response_data = response.json()
            if response_data.get("header", {}).get("message") == "Success":
                return response_data["Items"][0]["folderId"]
            elif response_data.get("header", {}).get("message") == "Parent folder not found":
                logger.info(f"Parent folder with ID {parent_id} not found. Creating it now...")
                # Create the parent folder if it doesn't exist
                self.create_folder(session, "Employee_Folders", parent_id=4)
                return self.create_folder(session, folder_name, parent_id)
        except requests.exceptions.JSONDecodeError:
            logger.error(f"Folder creation failed for {folder_name}, Response: {response.text}")
        return None

    def upload_file(self, session, file_path, folder_id):
        upload_url = "https://dmsstage.wepdigital.com/server/user/api/v7/department/file/create.json"
        file_name = os.path.basename(file_path)
        
        with open(file_path, 'rb') as f:
            files = {'departmentFile': (file_name, f)}

            data = {'folderId': folder_id, 'departmentId': 4}  

            response = session.post(upload_url, data=data, files=files, verify=False, headers={"Cookie": f"_app_vis_id_={cookie_key}"})
            logger.info(f"Uploading file: {file_name}, Status Code: {response.status_code}, Response: {response.text}")

            if response.status_code == 200:
                logger.info(f"File uploaded: {file_name}")
                return True
            else:
                logger.error(f"Failed to upload file: {file_name}")
                return False

    def process_employee_folders(self, session):
        df = pd.read_excel(self.excel_path)
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            for _, row in df.iterrows():
                employee_id = str(row["employee_id"])
                employee_name = row["employee_name"]
                
                # Create main employee folder inside departmentId=4
                employee_folder_name = f"{employee_id}_{employee_name}"
                employee_folder_id = self.create_folder(session, employee_folder_name, parent_id=4)
                if not employee_folder_id:
                    continue
                
                # Create subfolders for employee inside their respective folder
                employee_file_folder_id = self.create_folder(session, "employee_file", employee_folder_id)
                confidential_folder_id = self.create_folder(session, "confidential", employee_folder_id)

                # Use threading to upload files concurrently
                executor.submit(self.upload_files_for_employee, session, employee_id, employee_file_folder_id, "employee_file")
                executor.submit(self.upload_files_for_employee, session, employee_id, confidential_folder_id, "confidential")

    def upload_files_for_employee(self, session, employee_id, folder_id, folder_type):
        if folder_type == "employee_file":
            files_to_upload = [
                f"{employee_id}_joining_kit", f"{employee_id}_offer_letter", f"{employee_id}_nda", 
                f"{employee_id}_pf", f"{employee_id}_gratuity", f"{employee_id}_insurance", f"{employee_id}_nid"
            ]
        elif folder_type == "confidential":
            files_to_upload = [
                f"{employee_id}_bgv_reports_green", f"{employee_id}_bgv_reports_red", 
                f"{employee_id}_warning", f"{employee_id}_absconding", f"{employee_id}_showcase", f"{employee_id}_termination"
            ]
        else:
            return

        possible_extensions = ['.pdf', '.docx', '.txt', '.jpg', '.jpeg']

        for file_name in files_to_upload:
            file_found = False
            file_name_cleaned = file_name.strip()

            for ext in possible_extensions:
                file_path = os.path.join(self.migration_path, file_name_cleaned + ext)
                logger.info(f"Checking file path: {file_path}")

                if os.path.exists(file_path):
                    file_found = True
                    self.upload_file(session, file_path, folder_id)
                    break
            
            if not file_found:
                logger.warning(f"File {file_name} not found for employee {employee_id}")

if __name__ == "__main__":
    import sys
    app = QApplication(sys.argv)
    window = MigrationApp()
    window.show()
    sys.exit(app.exec())
