import os
import pandas as pd
import requests
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QLabel, QLineEdit, QPushButton,
    QFileDialog, QProgressBar, QMessageBox
)
from PyQt6.QtGui import QFont
from PyQt6.QtCore import QTimer
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Logging Setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("api_logger")
file_handler = logging.FileHandler("logfile.log")
file_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# Global Variables
cookie_key = ""
parent_folder_id = 145668  # Update this ID if needed

class MigrationApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Bulk File Uploader")
        self.setGeometry(400, 200, 600, 500)
        self.setup_ui()
        self.migration_path = ""
        self.excel_path = ""
        self.success_count = 0
        self.failed_count = 0
        self.total_files = 0

    def setup_ui(self):
        # Folder Selection UI
        self.label = QLabel("Choose folder path", self)
        self.label.setGeometry(150, 50, 220, 30)
        self.label.setFont(QFont("Arial", 12))

        self.line_edit = QLineEdit(self)
        self.line_edit.setGeometry(100, 80, 240, 30)

        self.select_button = QPushButton("Select Folder", self)
        self.select_button.setGeometry(350, 80, 120, 30)
        self.select_button.clicked.connect(self.browse_folder)

        # Excel Selection UI
        self.label_excel = QLabel("Choose Excel file", self)
        self.label_excel.setGeometry(150, 130, 220, 30)
        self.label_excel.setFont(QFont("Arial", 12))

        self.excel_edit = QLineEdit(self)
        self.excel_edit.setGeometry(100, 160, 240, 30)

        self.select_excel_button = QPushButton("Select Excel", self)
        self.select_excel_button.setGeometry(350, 160, 120, 30)
        self.select_excel_button.clicked.connect(self.browse_excel)

        # Upload Button
        self.upload_button = QPushButton("Upload Files", self)
        self.upload_button.setGeometry(180, 210, 140, 40)
        self.upload_button.clicked.connect(self.start_migration)

        # Progress Bar
        self.progress_bar = QProgressBar(self)
        self.progress_bar.setGeometry(100, 260, 350, 30)
        self.progress_bar.setValue(0)

        # Upload Status Labels
        self.success_label = QLabel("Successful Uploads: 0", self)
        self.success_label.setGeometry(100, 300, 250, 30)

        self.failed_label = QLabel("Failed Uploads: 0", self)
        self.failed_label.setGeometry(100, 330, 250, 30)

    def browse_folder(self):
        folder_path = QFileDialog.getExistingDirectory(self, "Select a folder")
        if folder_path:
            self.migration_path = folder_path
            self.line_edit.setText(folder_path)
            
            # Count total files
            self.total_files = len([f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))])
            logger.info(f"Total files found: {self.total_files}")

    def browse_excel(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Select Excel File", "", "Excel Files (*.xlsx *.xls)")
        if file_path:
            self.excel_path = file_path
            self.excel_edit.setText(file_path)

    def start_migration(self):
        if not self.migration_path or not self.excel_path:
            logger.error("Folder or Excel file not selected!")
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
            logger.error(f"Login failed! Response: {response.text}")
            return

        threading.Thread(target=self.process_employee_folders, args=(session,), daemon=True).start()

    def create_folder(self, session, folder_name, parent_id):
        create_folder_url = "https://flipkart.wepdigital.com/server/user/api/v7/department/folder/add.json"
        payload = {"departmentId": 1, "parentId": parent_id, "name": folder_name}
        headers = {"Cookie": f"_app_vis_id_={cookie_key}"}
        response = session.post(create_folder_url, data=payload, headers=headers)

        folder_id = response.json().get("Items", [{}])[0].get("folderId")
        if folder_id:
            logger.info(f"Folder '{folder_name}' created with ID: {folder_id}")
            return folder_id
        else:
            logger.error(f"Failed to create folder '{folder_name}' - Response: {response.text}")
            return None

    def upload_file(self, session, file_path, folder_id):
        upload_url = "https://flipkart.wepdigital.com/server/user/api/v7/department/file/create.json"
        with open(file_path, 'rb') as f:
            files = {'departmentFile': (os.path.basename(file_path), f)}
            data = {'folderId': folder_id, 'departmentId': 1}
            headers = {"Cookie": f"_app_vis_id_={cookie_key}"}
            response = session.post(upload_url, data=data, files=files, verify=False, headers=headers)

        if response.status_code == 200:
            logger.info(f"Successfully uploaded: {file_path}")
            return True
        else:
            logger.error(f"Upload failed for {file_path}. Response: {response.text}")
            return False

    def process_employee_folders(self, session):
        df = pd.read_excel(self.excel_path)
        self.progress_bar.setMaximum(self.total_files)

        with ThreadPoolExecutor(max_workers=5) as executor:
            for _, row in df.iterrows():
                employee_id = str(row["employee_id"])
                employee_name = row["employee_name"]
                
                employee_folder_id = self.create_folder(session, f"{employee_id}_{employee_name}", parent_folder_id)
                if not employee_folder_id:
                    continue

                for file_name in os.listdir(self.migration_path):
                    if file_name.startswith(employee_id):
                        file_path = os.path.join(self.migration_path, file_name)
                        executor.submit(self.upload_single_file, session, file_path, employee_folder_id)

    def upload_single_file(self, session, file_path, folder_id):
        success = self.upload_file(session, file_path, folder_id)
        QTimer.singleShot(0, lambda: self.update_ui(success))
        self.progress_bar.setValue(self.progress_bar.value() + 1)

        if self.success_count + self.failed_count == self.total_files:
            QTimer.singleShot(0, self.show_completion_message)

    def update_ui(self, success):
        if success:
            self.success_count += 1
        else:
            self.failed_count += 1
        self.success_label.setText(f"Successful Uploads: {self.success_count}")
        self.failed_label.setText(f"Failed Uploads: {self.failed_count}")

    def show_completion_message(self):
        QMessageBox.information(self, "Upload Complete", f"✅ Successful: {self.success_count}\n❌ Failed: {self.failed_count}")

if __name__ == "__main__":
    app = QApplication([])
    window = MigrationApp()
    window.show()
    app.exec()
