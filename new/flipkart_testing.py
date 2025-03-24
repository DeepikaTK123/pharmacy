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
parent_folder_id = 145668 

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
            return
        
        session = requests.Session()
        login_url = "https://flipkart.wepdigital.com/server/user/api/v7/auth/login.json"
        payload = {"loginName": "flipkart.ca", "password": "CompanyAdmin@123456 "}
        response = session.post(login_url, data=payload, verify=False)

        if response.status_code == 200 and response.cookies:
            global cookie_key
            cookie_key = response.cookies.values()[0]
            logger.info("Login successful!")
        else:
            return

        threading.Thread(target=self.process_employee_folders, args=(session,), daemon=True).start()

    def create_folder(self, session, folder_name, parent_id):
        create_folder_url = "https://flipkart.wepdigital.com/server/user/api/v7/department/folder/add.json"
        payload = {"departmentId": 1, "parentId": parent_id, "name": folder_name}
        headers = {"Cookie": f"_app_vis_id_={cookie_key}"}
        response = session.post(create_folder_url, data=payload, headers=headers)
        return response.json().get("Items", [{}])[0].get("folderId")

    def upload_file(self, session, file_path, folder_id):
        upload_url = "https://flipkart.wepdigital.com/server/user/api/v7/department/file/create.json"
        with open(file_path, 'rb') as f:
            files = {'departmentFile': (os.path.basename(file_path), f)}
            data = {'folderId': folder_id, 'departmentId': 1}
            response = session.post(upload_url, data=data, files=files, verify=False, headers={"Cookie": f"_app_vis_id_={cookie_key}"})
        return response.status_code == 200

    def process_employee_folders(self, session):
        df = pd.read_excel(self.excel_path)
        self.progress_bar.setMaximum(len(df) * 10)

        with ThreadPoolExecutor(max_workers=20) as executor:
            for _, row in df.iterrows():
                employee_id = str(row["employee_id"])
                employee_name = row["employee_name"]
                employee_folder_id = self.create_folder(session, f"{employee_id}_{employee_name}", parent_folder_id)
                if not employee_folder_id:
                    continue
                
                employee_file_folder_id = self.create_folder(session, "employee_file", employee_folder_id)
                confidential_folder_id = self.create_folder(session, "confidential", employee_folder_id)

                executor.submit(self.upload_files_for_employee, session, employee_id, employee_file_folder_id, "employee_file")
                executor.submit(self.upload_files_for_employee, session, employee_id, confidential_folder_id, "confidential")
        self.close()

    def upload_files_for_employee(self, session, employee_id, folder_id, folder_type):
        file_types = {
            "employee_file": ["joining_kit", "offer_letter", "nda", "pf", "gratuity", "insurance", "nid"],
            "confidential": ["BGV Reports-Green", "BGV Reports-Red", "warning", "absconding", "showcase", "termination"]
        }
        for suffix in file_types.get(folder_type, []):
            file_name = f"{employee_id}_{suffix}.pdf"
            file_path = os.path.join(self.migration_path, file_name)
            if os.path.exists(file_path):
                self.upload_file(session, file_path, folder_id)
                self.progress_bar.setValue(self.progress_bar.value() + 1)

if __name__ == "__main__":
    app = QApplication([])
    window = MigrationApp()
    window.show()
    app.exec()
