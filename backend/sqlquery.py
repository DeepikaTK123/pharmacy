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
        address TEXT, -- Added address column
        pincode VARCHAR(10), -- Added pincode column
        gst VARCHAR(15), -- Added gst column
        druglicense_no VARCHAR, -- Added druglicense_no column
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    '''
    cursor.execute(tenants)
    conn.commit()

    # Create medicines table
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
    profit DECIMAL(10, 2),  -- Added profit column
    tenant_id INT NOT NULL
);

    '''
    cursor.execute(medicines)
    conn.commit()

    billing_table = '''
CREATE TABLE IF NOT EXISTS billing (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255),
    phone_number VARCHAR(20),
    date DATE,
    dob DATE,
    status VARCHAR(50),
    discount DECIMAL(10, 2),
    subtotal DECIMAL(10, 2),
    cgst DECIMAL(10, 2), -- Added CGST column
    sgst DECIMAL(10, 2), -- Added SGST column
    total DECIMAL(10, 2),
    last_updated TIMESTAMP,
    medicines JSONB,
    tenant_id VARCHAR(255),
    age_year INT, -- Added age_year column
    age_month INT, -- Added age_month column
    gender VARCHAR(50), -- Added gender column
    ip_no VARCHAR(45) -- Added IP No. column
);

    '''
    cursor.execute(billing_table)
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
