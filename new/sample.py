from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QMessageBox, QProgressBar, QVBoxLayout,
    QLineEdit, QPushButton, QLabel, QFileDialog
)
from PyQt6.QtGui import QIcon, QFont
from PyQt6.QtCore import Qt
import sys
import pandas as pd
import requests
import os
import logging
import json

# Logging setup
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger('api_logger')

file_handler = logging.FileHandler('logfile.log')
file_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

class MigrationApp(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Bulk File Migration")
        self.setWindowIcon(QIcon("wep.png"))
        self.setGeometry(400, 200, 500, 400)

        self.label = QLabel("Select Folder for Migration", self)
        self.label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.label.setGeometry(50, 50, 400, 50)
        self.label.setFont(QFont('Arial', 15))
        self.label.setStyleSheet("color: blue")

        self.line_edit = QLineEdit(self)
        self.line_edit.setGeometry(100, 150, 240, 30)

        self.select_button = QPushButton("Select Folder", self)
        self.select_button.setGeometry(350, 150, 100, 30)
        self.select_button.setStyleSheet("background-color: #7C7070;color: black")
        self.select_button.clicked.connect(self.select_folder)

        self.upload_button = QPushButton("Start Upload", self)
        self.upload_button.setGeometry(200, 250, 120, 30)
        self.upload_button.setStyleSheet("background-color: blue;color: white")
        self.upload_button.clicked.connect(self.start_migration)

        self.progress_bar = QProgressBar(self)
        self.progress_bar.setGeometry(100, 300, 370, 30)
        self.progress_bar.setValue(0)

        self.folder_path = ""

    def select_folder(self):
        folder_path = QFileDialog.getExistingDirectory(self, "Select a folder")

        if folder_path:
            self.line_edit.setText(folder_path)
            self.folder_path = folder_path

    def start_migration(self):
        if not self.folder_path:
            QMessageBox.critical(self, "Error", "Please select a folder.")
            return

        self.migration_process = MigrationProcess(self.folder_path)
        self.migration_process.show()
        self.close()

class MigrationProcess(QMainWindow):
    def __init__(self, folder_path):
        super().__init__()

        self.setWindowTitle("Uploading Files")
        self.setGeometry(400, 200, 500, 400)

        self.progress_bar = QProgressBar(self)
        self.progress_bar.setGeometry(100, 300, 370, 30)
        self.progress_bar.setValue(0)

        self.folder_path = folder_path
        self.start_uploading()

    def start_uploading(self):
        """Start uploading files inside the folder under parentId=3963"""
        pdf_files = [os.path.join(self.folder_path, f) for f in os.listdir(self.folder_path) if f.endswith(".pdf")]
        total_file_size = sum(os.path.getsize(f) for f in pdf_files)

        self.progress_bar.setMaximum(total_file_size)

        uploaded_count = 0
        failed_count = 0

        # Step 1: Authenticate the user
        session = requests.Session()
        login_url = 'https://dmsstage.wepdigital.com/server/user/api/v7/auth/login.json'
        payload = {'loginName': 'company.admin', 'password': 'wepsol@789'}
        response = session.post(login_url, data=payload, verify=False)

        if response.status_code == 200 and response.cookies:
            cookie_key = response.cookies.values()[0]
            logger.info("Login successful")
        else:
            QMessageBox.critical(self, "Error", "Login failed. Check credentials.")
            return

        # Step 2: Create a folder inside parentId=3963
        folder_name = os.path.basename(self.folder_path)
        create_folder_url = 'https://dmsstage.wepdigital.com/server/user/api/v7/department/folder/add.json'
        folder_payload = {'departmentId': 4, 'parentId': 3963, 'name': folder_name}
        headers = {'Cookie': f'_app_vis_id_={cookie_key}'}

        folder_response = session.post(create_folder_url, data=folder_payload, headers=headers)
        folder_data = folder_response.json()

        if folder_data['header']['message'] == 'Success':
            parent_folder_id = folder_data['Items'][0]['folderId']
            logger.info(f"Created folder: {folder_name} with ID {parent_folder_id}")
        elif folder_data['header']['message'] == 'Folder name already exist':
            parent_folder_id = folder_data['Items'][0]['folderId']
            logger.info(f"Folder {folder_name} already exists. Using ID {parent_folder_id}")
        else:
            QMessageBox.critical(self, "Error", "Failed to create or find folder in application.")
            return

        # Step 3: Upload files inside the created folder
        for file in pdf_files:
            file_size = os.path.getsize(file)
            with open(file, 'rb') as file_data:
                files = {'departmentFile': file_data}
                upload_url = 'https://dmsstage.wepdigital.com/server/user/api/v7/department/file/create.json'
                upload_payload = {'departmentId': 4, 'parentId': parent_folder_id}
                headers = {'Cookie': f'_app_vis_id_={cookie_key}'}

                upload_response = session.post(upload_url, data=upload_payload, headers=headers, files=files)
                response_data = upload_response.json()

                if response_data['header']['message'] == 'Success':
                    self.progress_bar.setValue(self.progress_bar.value() + file_size)
                    uploaded_count += 1
                    logger.info(f"Uploaded file: {file}")
                else:
                    failed_count += 1
                    logger.error(f"Failed to upload: {file}")

        QMessageBox.information(self, "Upload Complete", f"Uploaded: {uploaded_count}, Failed: {failed_count}")
        logger.info(f"Total Uploaded: {uploaded_count}, Total Failed: {failed_count}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MigrationApp()
    window.show()
    sys.exit(app.exec())
