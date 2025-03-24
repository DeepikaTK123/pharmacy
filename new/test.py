from PyQt6.QtWidgets import QApplication, QMainWindow, QMessageBox, QLabel, QLineEdit, QPushButton, QFileDialog, QProgressBar
from PyQt6.QtGui import QIcon, QFont
import sys
import requests
import os
import logging
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
parent_folder_id = 3963 
uploaded_files_set = set() 


class MigrationApp(QMainWindow):

    def __init__(self):
        super().__init__()

        self.setWindowTitle("Bulk File Uploader")
        self.setWindowIcon(QIcon("wep.png"))
        self.setGeometry(400, 200, 500, 450)  

        # 🔹 UI Elements (Set precise positions)
        self.label = QLabel("Choose folder path", self)
        self.label.setGeometry(150, 50, 220, 50)
        self.label.setFont(QFont("Arial", 16))
        self.label.setStyleSheet("color: blue")

        self.line_edit = QLineEdit(self)
        self.line_edit.setGeometry(100, 100, 240, 30)

        self.select_button = QPushButton("Select Folder", self)
        self.select_button.setGeometry(340, 100, 120, 30)
        self.select_button.setStyleSheet("background-color: #7C7070; color: black")
        self.select_button.clicked.connect(self.browse_folder)

        self.upload_button = QPushButton("Upload Files", self)
        self.upload_button.setGeometry(180, 150, 140, 40)
        self.upload_button.setStyleSheet("background-color: blue; color: white")
        self.upload_button.clicked.connect(self.start_migration)

        self.progress_bar = QProgressBar(self)
        self.progress_bar.setGeometry(100, 210, 350, 30)
        self.progress_bar.setValue(0)

        self.uploaded_label = QLabel("Uploaded: 0", self)
        self.uploaded_label.setGeometry(100, 260, 200, 30)
        self.uploaded_label.setFont(QFont("Arial", 12))

        self.failed_label = QLabel(" Failed: 0", self)
        self.failed_label.setGeometry(100, 300, 200, 30)
        self.failed_label.setFont(QFont("Arial", 12))

        self.status_label = QLabel("", self)
        self.status_label.setGeometry(100, 350, 300, 30)
        self.status_label.setFont(QFont("Arial", 12))
        self.status_label.setStyleSheet("color: green")

        self.migration_path = ""  

    def browse_folder(self):
        folder_path = QFileDialog.getExistingDirectory(self, "Select a folder")
        if folder_path:
            self.migration_path = folder_path
            self.line_edit.setText(folder_path)

    def start_migration(self):
        if not self.migration_path:
            self.show_error_box("Please select a folder before uploading!")
            return

        self.progress_bar.setValue(0)

        try:
            session = requests.Session()
            login_url = "https://dmsstage.wepdigital.com/server/user/api/v7/auth/login.json"
            payload = {"loginName": "company.admin", "password": "wepsol@789"}
            response = session.post(login_url, data=payload, verify=False)

            if response.status_code == 200 and response.cookies:
                global cookie_key
                cookie_key = response.cookies.values()[0]
                logger.info(" Login successful, cookies stored!")
            else:
                logger.error("Login failed! Check credentials or internet connection.")
                self.show_error_box("Login failed! Check credentials or internet connection.")
                return

            # ✅ Upload files inside `parentId=3963`
            uploaded_count, failed_count = self.upload_files(session, parent_folder_id)

            # 🔹 Update UI with upload summary
            self.uploaded_label.setText(f"Uploaded: {uploaded_count}")
            self.failed_label.setText(f"Failed: {failed_count}")
            self.status_label.setText("Upload Completed!")

            # ✅ Stop UI from further uploads
            self.upload_button.setDisabled(True)

        except Exception as e:
            logger.exception("An error occurred during file migration.")
            self.show_error_box(str(e))

    def upload_files(self, session, parent_id):
        """
        Uploads files inside the selected folder.
        """
        uploaded_count = 0
        failed_count = 0

        pdf_files = [os.path.join(self.migration_path, f) for f in os.listdir(self.migration_path) if f.endswith(".pdf")]

        if not pdf_files:
            self.show_error_box("No PDF files found in the selected folder!")
            return 0, 0

        total_files = len(pdf_files)
        self.progress_bar.setMaximum(total_files)

        for file_path in pdf_files:
            file_name = os.path.basename(file_path)

            # 🔹 Avoid duplicate uploads
            if file_name in uploaded_files_set:
                continue

            try:
                # ✅ Upload File API
                upload_url = "https://dmsstage.wepdigital.com/server/user/api/v7/department/file/create.json"
                files = {"departmentFile": open(file_path, "rb")}
                payload = {"departmentId": 4, "parentId": parent_id}
                headers = {"Cookie": f"_app_vis_id_={cookie_key}"}

                response = session.post(upload_url, data=payload, headers=headers, files=files)
                response_data = response.json()

                if response_data["header"]["message"] == "Success":
                    file_id = response_data["Items"][0]["id"]
                    uploaded_files_set.add(file_name)
                    uploaded_count += 1
                    self.progress_bar.setValue(uploaded_count)
                    logger.info(f"File Uploaded: {file_name} (ID: {file_id})")
                else:
                    failed_count += 1
                    logger.error(f" Failed to upload file: {file_name}")

            except Exception as e:
                failed_count += 1
                logger.error(f"Exception while uploading {file_name}: {e}")

        return uploaded_count, failed_count

    def show_error_box(self, message):
        """
        Show an error message box.
        """
        msg_box = QMessageBox()
        msg_box.setIcon(QMessageBox.Icon.Critical)
        msg_box.setWindowTitle("Error")
        msg_box.setText(message)
        msg_box.setStandardButtons(QMessageBox.StandardButton.Ok)
        msg_box.exec()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MigrationApp()
    window.show()
    sys.exit(app.exec())
