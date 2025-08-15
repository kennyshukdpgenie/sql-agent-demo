import pyodbc
import os
import sys
import json
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Default to False if not set
USE_SQLSERVER = os.getenv('USE_SQLSERVER', 'false').lower() == 'true'

def get_db_connection():
    """Create and return a database connection"""
    if not USE_SQLSERVER:
        print("SQL Server connection is disabled. Set USE_SQLSERVER=true in .env to enable.", file=sys.stderr)
        return None
        
    try:
        # These values will be None if not set in the environment
        server = os.getenv('DB_HOST')
        database = os.getenv('DB_NAME')
        username = os.getenv('DB_USER')
        password = os.getenv('DB_PASSWORD')
        port = os.getenv('DB_PORT')
        
        # Check if required values are set
        if not all([server, database, username, password, port]):
            missing = []
            if not server: missing.append('DB_HOST')
            if not database: missing.append('DB_NAME')
            if not username: missing.append('DB_USER')
            if not password: missing.append('DB_PASSWORD')
            if not port: missing.append('DB_PORT')
            
            print(f"Missing required SQL Server environment variables: {', '.join(missing)}", file=sys.stderr)
            return None
            
        # Strip quotes from values if present
        username = username.strip("'")
        password = password.strip("'")
        
        driver = '{ODBC Driver 18 for SQL Server}'
        
        # Format the server string with port
        server_with_port = f"{server},{port}"
        
        conn_str = (
            f"DRIVER={driver};"
            f"SERVER={server_with_port};"
            f"DATABASE={database};"
            f"UID={username};"
            f"PWD={password};"
            "TrustServerCertificate=yes;"
            "Encrypt=yes;"
        )
        
        print(f"Attempting to connect with connection string: {conn_str}", file=sys.stderr)
        
        conn = pyodbc.connect(conn_str)
        print("Successfully connected to database", file=sys.stderr)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {str(e)}", file=sys.stderr)
        return None

def insert_order(order_data):
    """Insert a new order into the database"""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            print("Cannot insert order: No database connection available", file=sys.stderr)
            return False
            
        cursor = conn.cursor()
        
        print(f"Preparing to insert order data: {json.dumps(order_data, indent=2)}", file=sys.stderr)
        
        # Ensure measurements are properly formatted as floats
        if 'measurements' in order_data and isinstance(order_data['measurements'], dict):
            for key, value in order_data['measurements'].items():
                try:
                    order_data['measurements'][key] = float(value)
                except (ValueError, TypeError):
                    print(f"Invalid measurement value for {key}: {value}", file=sys.stderr)
                    return False
        
        # Updated query to match the actual table schema
        query = """
        INSERT INTO Test (
            customer_name,
            contact_phone,
            order_date,
            delivery_date,
            suit_type,
            fabric,
            color,
            size,
            chest_measurement,
            waist_measurement,
            hip_measurement,
            shoulder_width,
            sleeve_length,
            back_length,
            special_requirements
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        # Make sure all required values are present
        try:
            # Updated values mapping to match the table schema
            values = (
                order_data['customer_name'],
                order_data['phone'],  # maps to contact_phone
                order_data['order_date'],
                order_data['delivery_date'],
                order_data['suit_type'],
                order_data['fabric'],
                order_data['color'],
                order_data['size'],
                float(order_data['measurements']['chest']),  # maps to chest_measurement
                float(order_data['measurements']['waist']),  # maps to waist_measurement
                float(order_data['measurements']['hips']),   # maps to hip_measurement
                float(order_data['measurements']['shoulder']), # maps to shoulder_width
                float(order_data['measurements']['sleeve']),   # maps to sleeve_length
                float(order_data['measurements']['back_length']), # maps to back_length
                order_data.get('special_requests', '')  # maps to special_requirements
            )
        except KeyError as e:
            print(f"Missing required field in order data: {e}", file=sys.stderr)
            return False
        except (ValueError, TypeError) as e:
            print(f"Invalid measurement value: {e}", file=sys.stderr)
            return False
        
        print(f"Executing SQL query with values: {values}", file=sys.stderr)
        
        # Execute the query
        cursor.execute(query, values)
        
        # Check if the insert was successful
        if cursor.rowcount <= 0:
            print("No rows affected by insert operation", file=sys.stderr)
            conn.rollback()
            return False
            
        conn.commit()
        print(f"Successfully inserted order into database, rows affected: {cursor.rowcount}", file=sys.stderr)
        return True
        
    except Exception as e:
        print(f"Error inserting order: {str(e)}", file=sys.stderr)
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()
            print("Database connection closed", file=sys.stderr)

def get_orders():
    """Fetch all orders from the database"""
    conn = None
    try:
        conn = get_db_connection()
        if conn is None:
            print("Cannot get orders: No database connection available", file=sys.stderr)
            return []
            
        cursor = conn.cursor()
        
        print(f"Fetching all orders from the database", file=sys.stderr)
        
        # Query to get all orders from the Test table
        query = '''
            SELECT 
                id,
                customer_name,
                contact_phone,
                order_date,
                delivery_date,
                suit_type,
                fabric,
                color,
                size,
                chest_measurement,
                waist_measurement,
                hip_measurement,
                shoulder_width,
                sleeve_length,
                back_length,
                special_requirements
            FROM Test
        '''
        
        print(f"Executing query: {query}", file=sys.stderr)
        cursor.execute(query)
        
        # Get all rows and print the count for debugging
        rows = cursor.fetchall()
        row_count = len(rows)
        print(f"Query returned {row_count} rows", file=sys.stderr)
        
        orders = []
        for row in rows:
            # Print each row ID for debugging
            print(f"Processing row with ID: {row[0]}", file=sys.stderr)
            
            # Convert row to dictionary with the frontend-expected structure
            order = {
                "id": row[0],
                "customer_name": row[1],
                "phone": row[2],
                "order_date": row[3].isoformat() if row[3] else None,
                "delivery_date": row[4].isoformat() if row[4] else None,
                "suit_type": row[5],
                "fabric": row[6],
                "color": row[7],
                "size": row[8],
                "measurements": {
                    "chest": row[9],
                    "waist": row[10],
                    "hips": row[11],
                    "shoulder": row[12],
                    "sleeve": row[13],
                    "back_length": row[14]
                },
                "special_requests": row[15]
            }
            orders.append(order)
        
        print(f"Successfully processed {len(orders)} orders to return", file=sys.stderr)
        
        # Don't truncate the results - ensure we return all orders
        return orders
        
    except Exception as e:
        print(f"Error fetching orders: {str(e)}", file=sys.stderr)
        raise
    finally:
        if conn:
            conn.close()
            print("Database connection closed", file=sys.stderr)

def update_order(order_id, order_data):
    """Update an existing order in the database"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        print(f"Preparing to update order {order_id} with data: {order_data}", file=sys.stderr)
        
        # Check if order exists
        cursor.execute('SELECT id FROM Test WHERE id = ?', (order_id,))
        if not cursor.fetchone():
            print(f"Order with ID {order_id} not found", file=sys.stderr)
            return False, "Order not found"
        
        # Prepare update fields
        update_fields = {}
        values = []
        
        if 'customer_name' in order_data and order_data['customer_name'] is not None:
            update_fields['customer_name'] = '?'
            values.append(order_data['customer_name'])
            
        if 'phone' in order_data and order_data['phone'] is not None:
            update_fields['contact_phone'] = '?'
            values.append(order_data['phone'])
            
        if 'order_date' in order_data and order_data['order_date'] is not None:
            update_fields['order_date'] = '?'
            values.append(order_data['order_date'])
            
        if 'delivery_date' in order_data and order_data['delivery_date'] is not None:
            update_fields['delivery_date'] = '?'
            values.append(order_data['delivery_date'])
            
        if 'suit_type' in order_data and order_data['suit_type'] is not None:
            update_fields['suit_type'] = '?'
            values.append(order_data['suit_type'])
            
        if 'fabric' in order_data and order_data['fabric'] is not None:
            update_fields['fabric'] = '?'
            values.append(order_data['fabric'])
            
        if 'color' in order_data and order_data['color'] is not None:
            update_fields['color'] = '?'
            values.append(order_data['color'])
            
        if 'size' in order_data and order_data['size'] is not None:
            update_fields['size'] = '?'
            values.append(order_data['size'])
        
        # Handle measurements separately
        if 'measurements' in order_data and order_data['measurements'] is not None:
            measurements = order_data['measurements']
            if isinstance(measurements, str):
                try:
                    measurements = json.loads(measurements)
                except:
                    pass
                    
            if isinstance(measurements, dict):
                if 'chest' in measurements:
                    update_fields['chest_measurement'] = '?'
                    values.append(float(measurements['chest']))
                    
                if 'waist' in measurements:
                    update_fields['waist_measurement'] = '?'
                    values.append(float(measurements['waist']))
                    
                if 'hips' in measurements:
                    update_fields['hip_measurement'] = '?'
                    values.append(float(measurements['hips']))
                    
                if 'shoulder' in measurements:
                    update_fields['shoulder_width'] = '?'
                    values.append(float(measurements['shoulder']))
                    
                if 'sleeve' in measurements:
                    update_fields['sleeve_length'] = '?'
                    values.append(float(measurements['sleeve']))
                    
                if 'back_length' in measurements:
                    update_fields['back_length'] = '?'
                    values.append(float(measurements['back_length']))
        
        if 'special_requests' in order_data and order_data['special_requests'] is not None:
            update_fields['special_requirements'] = '?'
            values.append(order_data['special_requests'])
        
        if not update_fields:
            print("No fields to update", file=sys.stderr)
            return True, "No fields to update"
        
        # Build and execute update query
        set_clause = ", ".join([f"{field} = {placeholder}" for field, placeholder in update_fields.items()])
        query = f"UPDATE Test SET {set_clause} WHERE id = ?"
        values.append(order_id)
        
        print(f"Executing SQL query: {query} with values: {values}", file=sys.stderr)
        cursor.execute(query, values)
        conn.commit()
        
        print(f"Successfully updated order {order_id}", file=sys.stderr)
        return True, "Order updated successfully"
        
    except Exception as e:
        print(f"Error updating order: {str(e)}", file=sys.stderr)
        if conn:
            conn.rollback()
        return False, str(e)
    finally:
        if conn:
            conn.close()
            print("Database connection closed", file=sys.stderr)

def test_insert():
    """Test function to insert sample data"""
    try:
        # Sample order data matching your example
        test_order = {
            'customer_name': 'Jacob',
            'phone': '123-456-7890',
            'order_date': '2025-04-01',
            'delivery_date': '2025-04-15',
            'suit_type': 'Business Suit',
            'fabric': 'Wool',
            'color': 'Navy Blue',
            'size': 'Large',
            'measurements': {
                'chest': 42.50,
                'waist': 36.20,
                'hips': 40.00,
                'shoulder': 18.50,
                'sleeve': 24.75,
                'back_length': 29.00
            },
            'special_requests': 'Add monogram on left breast pocket'
        }
        
        # Try to insert the test order
        success = insert_order(test_order)
        if success:
            print("Test insertion successful!")
        
    except Exception as e:
        print(f"Test insertion failed: {str(e)}")

if __name__ == "__main__":
    # Test the database connection and insertion
    try:
        print("Testing database connection...")
        conn = get_db_connection()
        print("Successfully connected to the database!")
        conn.close()
        
        print("\nTesting order insertion...")
        test_insert()
        
    except Exception as e:
        print(f"Test failed: {str(e)}") 