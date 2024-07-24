import subprocess
import os

def restore_postgresql_db(host, port, dbname, user, password, backup_filename):
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backup_filepath = os.path.join(script_dir, backup_filename)

    # Create the Docker command to run psql for restoring the database
    command = [
        'docker', 'run', '--rm', '-v', f"{script_dir}:/backup",
        '--network', 'host',  # Use host network to connect to the local Docker network
        '-e', f"PGPASSWORD={password}",
        'postgres:16', 'psql',
        '-h', host,
        '-p', str(port),
        '-U', user,
        '-d', dbname,  # The database to restore into
        '-f', f"/backup/{backup_filename}"
    ]

    # Execute the command
    try:
        result = subprocess.run(command, check=True, text=True, capture_output=True)
        print(f"Restore successful! Backup file restored to database: {dbname}")
        print(f"Command Output: {result.stdout}")
        print(f"Command Error Output (if any): {result.stderr}")
    except subprocess.CalledProcessError as e:
        print(f"Error during restore: {e}")
        print(f"Output: {e.output}")
        print(f"Error Output: {e.stderr}")

# Usage
if __name__ == "__main__":
    HOST = '13.201.133.86'  # Replace with the target PostgreSQL host
    PORT = 5432  # Default PostgreSQL port
    DBNAME = 'hospital_management'  # The name of the database to restore into
    USER = 'Venki'
    PASSWORD = 'Venki@034'
    BACKUP_FILENAME = 'hospital_management_backup_20240724002957.sql'  # The backup file to restore from

    restore_postgresql_db(HOST, PORT, DBNAME, USER, PASSWORD, BACKUP_FILENAME)
