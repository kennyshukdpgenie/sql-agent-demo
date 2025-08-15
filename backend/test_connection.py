#!/usr/bin/env python3

import sys
import database_handler
import sqlite3
import os
import json
from dotenv import load_dotenv
import time

# Get the absolute path for the database
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'suit_store.db')

def test_sqlite_connection():
    """Test the SQLite database connection"""
    try:
        print("\n===== Testing SQLite Connection =====")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Test if the orders table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'")
        tables = cursor.fetchall()
        
        if tables:
            print(f"✅ SQLite database has the orders table")
            # Count the number of records
            cursor.execute("SELECT COUNT(*) FROM orders")
            count = cursor.fetchone()[0]
            print(f"✅ SQLite database has {count} orders")
            
            # Get the most recent order
            if count > 0:
                cursor.execute("SELECT id, customer_name, order_date FROM orders ORDER BY id DESC LIMIT 1")
                last_order = cursor.fetchone()
                print(f"✅ Most recent order: ID={last_order[0]}, Customer={last_order[1]}, Date={last_order[2]}")
        else:
            print("❌ SQLite database is missing the orders table!")
            
        conn.close()
        return True
    except Exception as e:
        print(f"❌ SQLite connection test failed: {str(e)}")
        return False

def test_sqlserver_connection():
    """Test the SQL Server database connection"""
    try:
        print("\n===== Testing SQL Server Connection =====")
        # Load environment variables for SQL Server
        load_dotenv()
        
        # Check if SQL Server is enabled
        use_sqlserver = os.getenv('USE_SQLSERVER', 'false').lower() == 'true'
        if not use_sqlserver:
            print("⚠️ SQL Server connection is disabled in .env file")
            return False
            
        conn = database_handler.get_db_connection()
        if conn:
            print("✅ Successfully connected to SQL Server")
            conn.close()
            print("✅ Connection closed properly")
            return True
        else:
            print("❌ Failed to connect to SQL Server")
            return False
    except Exception as e:
        print(f"❌ SQL Server connection test failed: {str(e)}")
        return False

def test_order_insertion():
    """Test inserting a test order into both databases"""
    try:
        print("\n===== Testing Order Insertion =====")
        
        # Create a test order
        timestamp = int(time.time())
        test_order = {
            'customer_name': f'Test User {timestamp}',
            'phone': '123-456-7890',
            'order_date': '2025-04-01',
            'delivery_date': '2025-04-15',
            'suit_type': 'Test Suit',
            'fabric': 'Test Fabric',
            'color': 'Test Color',
            'size': 'Test Size',
            'measurements': {
                'chest': 42.0,
                'waist': 36.0,
                'hips': 40.0,
                'shoulder': 18.0,
                'sleeve': 24.0,
                'back_length': 29.0
            },
            'special_requests': f'Test request {timestamp}'
        }
        
        # Test SQL Server insertion
        print("\nTesting SQL Server insertion:")
        try:
            sql_success = database_handler.insert_order(test_order)
            if sql_success:
                print("✅ Successfully inserted test order into SQL Server")
            else:
                print("❌ Failed to insert test order into SQL Server")
        except Exception as e:
            print(f"❌ Error inserting test order into SQL Server: {str(e)}")
        
        # Test SQLite insertion
        print("\nTesting SQLite insertion:")
        try:
            # Convert measurements to JSON for SQLite storage
            measurements_json = json.dumps(test_order['measurements'])
            
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('''INSERT INTO orders 
                        (customer_name, phone, order_date, delivery_date, 
                        suit_type, fabric, color, size, measurements, special_requests)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                    (test_order['customer_name'], 
                    test_order['phone'], 
                    test_order['order_date'], 
                    test_order['delivery_date'],
                    test_order['suit_type'], 
                    test_order['fabric'], 
                    test_order['color'], 
                    test_order['size'],
                    measurements_json, 
                    test_order.get('special_requests', '')))
            
            order_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            if order_id:
                print(f"✅ Successfully inserted test order into SQLite with ID {order_id}")
                return True
            else:
                print("❌ Failed to insert test order into SQLite")
                return False
        except Exception as e:
            print(f"❌ Error inserting test order into SQLite: {str(e)}")
            return False
            
    except Exception as e:
        print(f"❌ Order insertion test failed: {str(e)}")
        return False

if __name__ == "__main__":
    # Run all tests
    sqlite_success = test_sqlite_connection()
    sqlserver_success = test_sqlserver_connection()
    insertion_success = test_order_insertion()
    
    # Summary
    print("\n===== Test Summary =====")
    print(f"SQLite Connection: {'✅ Success' if sqlite_success else '❌ Failed'}")
    print(f"SQL Server Connection: {'✅ Success' if sqlserver_success else '❌ Failed or Disabled'}")
    print(f"Order Insertion: {'✅ Success' if insertion_success else '❌ Failed'}")
    
    if sqlite_success:
        print("\n✅ Your application should be able to store orders in the SQLite database")
    if sqlserver_success:
        print("✅ Your application should be able to store orders in the SQL Server database")
    if not sqlite_success and not sqlserver_success:
        print("❌ No database connections are working! Please check your configuration")
    
    print("\nDone!") 