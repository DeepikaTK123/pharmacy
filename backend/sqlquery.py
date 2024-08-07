import psycopg2
from psycopg2 import sql

# ahost="128.199.19.234"
ahost="localhost"

def create_table():
    conn = psycopg2.connect(
        user="Venki",
        password="Venki@034",
        host=ahost,
        port="5432",
        database="hospital_management"
    )
    cursor = conn.cursor()

    tenants = '''
       CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        tenant_id VARCHAR,
        username VARCHAR UNIQUE NOT NULL,
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        phonenumber VARCHAR NOT NULL,
        company_name VARCHAR,
        address TEXT,
        pincode VARCHAR(10), 
        gst VARCHAR(15),
        druglicense_no VARCHAR,
        logo TEXT,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    '''
    cursor.execute(tenants)
    conn.commit()

    medicines = '''
        CREATE TABLE IF NOT EXISTS medicines (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            batch_no VARCHAR(100) NOT NULL,
            manufactured_by VARCHAR(255) NOT NULL,
            quantity INT NOT NULL,
            expiry_date DATE NOT NULL,
            mrp DECIMAL(10, 2) NOT NULL,
            cgst DECIMAL(5, 2) NOT NULL,
            sgst DECIMAL(5, 2) NOT NULL,
            total DECIMAL(10, 2) NOT NULL,
            rate DECIMAL(10, 2),
            profit DECIMAL(10, 2),
            tenant_id VARCHAR NOT NULL
        );
    '''
    cursor.execute(medicines)
    conn.commit()

    billing_table = '''
       CREATE TABLE billing (
            id SERIAL PRIMARY KEY,
            patient_name VARCHAR(255),
            phone_number VARCHAR(20),
            date DATE,
            status VARCHAR(50),
            discount NUMERIC(10, 2),
            subtotal NUMERIC(10, 2),
            cgst NUMERIC(10, 2),
            sgst NUMERIC(10, 2),
            total NUMERIC(10, 2),
            last_updated TIMESTAMP,
            items JSONB,
            tenant_id VARCHAR(255),
            age_year INT,
            age_month INT,
            gender VARCHAR(10),
            patient_number VARCHAR(50),
            dob DATE
        );

    '''
    cursor.execute(billing_table)
    conn.commit()

    prescriptions = '''
        CREATE TABLE IF NOT EXISTS prescriptions (
            id SERIAL PRIMARY KEY,
            doctor_name VARCHAR(255) NOT NULL,
            patient_name VARCHAR(255) NOT NULL,
            phone_number VARCHAR(15) NOT NULL,
            patient_id VARCHAR(50),
            patient_dob DATE NOT NULL,
            patient_gender VARCHAR(10) NOT NULL,
            blood_pressure VARCHAR(50),
            temperature VARCHAR(50),
            heart_beat VARCHAR(50),
            spo2 VARCHAR(50),
            diagnosis TEXT,
            medication JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tenant_id VARCHAR(255)
        );
    '''
    cursor.execute(prescriptions)
    conn.commit()

    services = '''
        CREATE TABLE IF NOT EXISTS services (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tenant_id VARCHAR(255)
        );
    '''
    cursor.execute(services)
    conn.commit()

    patients = '''
        CREATE TABLE IF NOT EXISTS patients (
            id SERIAL PRIMARY KEY,
            patient_no VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            phone_number VARCHAR(20) NOT NULL,
            dob DATE NOT NULL,
            gender VARCHAR(10) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tenant_id VARCHAR(255)
        );
    '''
    cursor.execute(patients)
    conn.commit()

    conn.close()
    print("Tables created successfully.")

def alter_table():
    conn = psycopg2.connect(
        user="Venki",
        password="Venki@034",
        host=ahost,
        port="5432",
        database="hospital_management"
    )
    cursor = conn.cursor()

    alter_medicines = '''
       ALTER TABLE medicines
ADD COLUMN sold INT DEFAULT 0;
    '''
    cursor.execute(alter_medicines)
    conn.commit()
    conn.close()
    print("Tables altered successfully.")


create_table()
# alter_table()
