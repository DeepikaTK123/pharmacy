import subprocess
import os

def restore_postgresql_db(host, port, dbname, user, password, backup_filename):
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backup_filepath = os.path.join(script_dir, backup_filename)

    # Drop schema and recreate it
    drop_command = [
        'docker', 'run', '--rm', '-v', f"{script_dir}:/backup",
        '--network', 'host',
        '-e', f"PGPASSWORD={password}",
        'postgres:16', 'psql',
        '-h', host,
        '-p', str(port),
        '-U', user,
        '-d', dbname,
        '-c', 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
    ]

    # Execute the drop schema command
    try:
        drop_result = subprocess.run(drop_command, check=True, text=True, capture_output=True)
        print(f"Schema dropped and recreated. Output: {drop_result.stdout}")
    except subprocess.CalledProcessError as e:
        print(f"Error dropping schema: {e}")
        print(f"Output: {e.output}")
        print(f"Error Output: {e.stderr}")
        return

    # Create the Docker command to run psql for restoring the database
    restore_command = [
        'docker', 'run', '--rm', '-v', f"{script_dir}:/backup",
        '--network', 'host',
        '-e', f"PGPASSWORD={password}",
        'postgres:16', 'psql',
        '-h', host,
        '-p', str(port),
        '-U', user,
        '-d', dbname,
        '-f', f"/backup/{backup_filename}"
    ]

    # Execute the restore command
    try:
        result = subprocess.run(restore_command, check=True, text=True, capture_output=True)
        print(f"Restore successful! Backup file restored to database: {dbname}")
        print(f"Command Output: {result.stdout}")
        print(f"Command Error Output (if any): {result.stderr}")
    except subprocess.CalledProcessError as e:
        print(f"Error during restore: {e}")
        print(f"Output: {e.output}")
        print(f"Error Output: {e.stderr}")

# Usage
if __name__ == "__main__":
    HOST = '128.199.19.234'
    PORT = 5432
    DBNAME = 'hospital_management'
    USER = 'Venki'
    PASSWORD = 'Venki@034'
    BACKUP_FILENAME = 'hospital_management_backup_20241014233919.sql'

    restore_postgresql_db(HOST, PORT, DBNAME, USER, PASSWORD, BACKUP_FILENAME)
