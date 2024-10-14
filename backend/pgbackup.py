import subprocess
import datetime
import os

def backup_postgresql_db(host, port, dbname, user, password):
    # Get the current date and time to include in the backup file name
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    backup_filename = f"{dbname}_backup_{timestamp}.sql"
    
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backup_filepath = os.path.join(script_dir, backup_filename)

    # Create the Docker command to run pg_dump
    command = [
        'docker', 'run', '--rm', '-v', f"{script_dir}:/backup",
        '--network', 'host',  # Use host network to connect to the local Docker network
        '-e', f"PGPASSWORD={password}",
        'postgres:16', 'pg_dump',
        '-h', host,
        '-p', str(port),
        '-U', user,
        '-F', 'p',  # Plain text format
        '-b',       # Include large objects
        '-v',       # Verbose mode
        '-f', f"/backup/{backup_filename}",
        dbname
    ]

    # Execute the command
    try:
        result = subprocess.run(command, check=True, text=True, capture_output=True)
        print(f"Backup successful! Backup file created at: {backup_filepath}")
        print(f"Command Output: {result.stdout}")
        print(f"Command Error Output (if any): {result.stderr}")
    except subprocess.CalledProcessError as e:
        print(f"Error during backup: {e}")
        print(f"Output: {e.output}")
        print(f"Error Output: {e.stderr}")

# Usage
if __name__ == "__main__":
    HOST = 'localhost'
    PORT = 5432  # Default PostgreSQL port
    DBNAME = 'hospital_management'
    USER = 'Venki'
    PASSWORD = 'Venki@034'

    backup_postgresql_db(HOST, PORT, DBNAME, USER, PASSWORD)
