import pandas as pd

# Define the employee file structure based on the given requirements
data = {
    "Employee ID": [56001, 56009, 56011],  # Example employee IDs
    "Employee Name": ["John Doe", "Jane Smith", "Mark Johnson"],
    "Main Folder": ["56001_John Doe", "56009_Jane Smith", "56011_Mark Johnson"],
    "Sub Folders": [
        "employee_file, confidential",
        "employee_file, confidential",
        "employee_file, confidential"
    ],
    "Employee File Contents": [
        "56001_Joining_Kit, 56001_Offer_Letter, 56001_NDA, 56001_PF, 56001_Gratuity, 56001_Insurance, 56001_NID",
        "56009_Joining_Kit, 56009_Offer_Letter, 56009_NDA, 56009_PF, 56009_Gratuity, 56009_Insurance, 56009_NID",
        "56011_Joining_Kit, 56011_Offer_Letter, 56011_NDA, 56011_PF, 56011_Gratuity, 56011_Insurance, 56011_NID"
    ],
    "Confidential File Contents": [
        "56001_BGV Reports-Green, 56001_BGV Reports-Red, 56001_Warning, 56001_Absconding, 56001_Showcase, 56001_Termination",
        "56009_BGV Reports-Green, 56009_BGV Reports-Red, 56009_Warning, 56009_Absconding, 56009_Showcase, 56009_Termination",
        "56011_BGV Reports-Green, 56011_BGV Reports-Red, 56011_Warning, 56011_Absconding, 56011_Showcase, 56011_Termination"
    ]
}

# Create a DataFrame
df = pd.DataFrame(data)

# Save to Excel file
file_path = "Employee_File_Structure.xlsx"
df.to_excel(file_path, index=False)

# Display the file to the user
import ace_tools as tools
tools.display_dataframe_to_user(name="Employee File Structure", dataframe=df)

file_path
