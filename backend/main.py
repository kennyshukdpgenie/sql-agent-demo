from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import sqlite3
import json
import socket
import sys
import os
import traceback
import datetime
import uvicorn
import pyodbc
from dotenv import load_dotenv

app = FastAPI()

# Define table name and columns to avoid hardcoding
TABLE_NAME = "shirt_orders"
TABLE_COLUMNS = {
    "id": "INT IDENTITY(1,1) PRIMARY KEY",
    "姓名": "VARCHAR(50) NOT NULL",
    "身高": "DECIMAL(5,2)",
    "体重_KG": "DECIMAL(5,2)",
    "电话": "VARCHAR(20)",
    "使用时间": "DATE",
    "下单日期": "DATE",
    "到店交付日期": "DATE",
    "实际交付日期": "DATE",
    "定制工艺": "VARCHAR(20)",
    "工艺": "VARCHAR(20)",
    "西装净体领围": "DECIMAL(5,2)",
    "西装肩宽": "DECIMAL(5,2)",
    "西装袖长": "DECIMAL(5,2)",
    "西装袖肥": "DECIMAL(5,2)",
    "西装袖口": "DECIMAL(5,2)",
    "西装胸围": "DECIMAL(5,2)",
    "西装中腰": "DECIMAL(5,2)",
    "西装下摆臀围": "DECIMAL(5,2)",
    "西装前衣长": "DECIMAL(5,2)",
    "西装后衣长": "DECIMAL(5,2)",
    "西装前腰节": "DECIMAL(5,2)",
    "西装后腰节": "DECIMAL(5,2)",
    "西装左肩斜": "DECIMAL(5,2)",
    "西装右肩斜": "DECIMAL(5,2)",
    "西装背胸差": "DECIMAL(5,2)",
    "西装前胸宽": "DECIMAL(5,2)",
    "西装后背宽": "DECIMAL(5,2)",
    "西装袖笼差": "DECIMAL(5,2)",
    "西装袖笼深": "DECIMAL(5,2)",
    "西装袖笼围": "DECIMAL(5,2)",
    "西装数量": "INT",
    "西裤裤腰围": "DECIMAL(5,2)",
    "西裤臀围": "DECIMAL(5,2)",
    "西裤大腿圈": "DECIMAL(5,2)",
    "西裤膝围": "DECIMAL(5,2)",
    "西裤小腿圈": "DECIMAL(5,2)",
    "西裤小腿高": "DECIMAL(5,2)",
    "西裤裤长": "DECIMAL(5,2)",
    "西裤遮档": "DECIMAL(5,2)",
    "西裤腰高": "DECIMAL(5,2)",
    "西裤裤前褶": "VARCHAR(20)",
    "西裤皮带袢": "VARCHAR(20)",
    "西裤卷边": "VARCHAR(20)",
    "西裤调山袢": "VARCHAR(20)",
    "西装面料": "VARCHAR(20)",
    "西裤数量": "INT",
    "马甲肩宽": "DECIMAL(5,2)",
    "马甲胸围": "DECIMAL(5,2)",
    "马甲中腰肚围": "DECIMAL(5,2)",
    "马甲下摆": "DECIMAL(5,2)",
    "马甲前衣长": "DECIMAL(5,2)",
    "马甲后衣长": "DECIMAL(5,2)",
    "马甲袖肥": "DECIMAL(5,2)",
    "马甲袖口": "DECIMAL(5,2)",
    "马甲扣数": "INT",
    "马甲排数": "VARCHAR(20)",
    "马甲口袋": "VARCHAR(20)",
    "马甲背面": "VARCHAR(20)",
    "马甲领子": "VARCHAR(20)",
    "马甲侧面开叉": "VARCHAR(20)",
    "马甲数量": "INT",
    "衬衫领围": "DECIMAL(5,2)",
    "衬衫肩宽": "DECIMAL(5,2)",
    "衬衫袖长": "DECIMAL(5,2)",
    "衬衫领型": "DECIMAL(5,2)",
    "衬衫袖口": "DECIMAL(5,2)",
    "衬衫面料": "VARCHAR(50)",
    "衬衫数量": "INT",
    "款式备注": "VARCHAR(50)",
    "体型备注": "VARCHAR(50)",
    "里布": "VARCHAR(50)",
    "客户来源": "VARCHAR(50)",
    "接待人员": "VARCHAR(50)",
    "定制顾问": "VARCHAR(50)",
    "定制金额": "DECIMAL(5,2)"
}



# Load environment variables from .env file
load_dotenv()

# Configure CORS with more specific settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://akheartebespoken.com",
        "https://akheartebespoken.com",
        "http://www.akheartebespoken.com",
        "https://www.akheartebespoken.com",
        "http://8.153.205.171:8889",  # Cloud ECS address
        "http://8.153.205.171",       # Cloud ECS address without port
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Register startup event to initialize database
@app.on_event("startup")
async def startup_event():
    print("Server starting up", file=sys.stderr)
    init_db()
    print("Database initialized on startup", file=sys.stderr)

# Function to get the current machine's IP address
def get_host_ip():
    try:
        # Create a socket to determine the outgoing IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Connect to a public server (doesn't actually establish a connection)
        s.connect(("8.8.8.8", 80))
        # Get the local IP address
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        # Fall back to localhost if there's an error
        return "127.0.0.1"

# Get database connection parameters from environment variables
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

# Flag to determine if we should use SQL Server
USE_SQLSERVER = all([DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME])

def get_db_connection():
    """Create and return a database connection to the SQL Server"""
    if not USE_SQLSERVER:
        print("SQL Server connection is disabled due to missing environment variables.", file=sys.stderr)
        return None
        
    try:
        # Strip quotes from values if present
        username = DB_USER.strip("'")
        password = DB_PASSWORD.strip("'")
        
        driver = '{ODBC Driver 18 for SQL Server}'
        
        # Format the server string with port
        server_with_port = f"{DB_HOST},{DB_PORT}"
        
        conn_str = (
            f"DRIVER={driver};"
            f"SERVER={server_with_port};"
            f"DATABASE={DB_NAME};"
            f"UID={username};"
            f"PWD={password};"
            "TrustServerCertificate=yes;"
            "Encrypt=yes;"
        )
        
        print(f"Connecting to SQL Server: {DB_HOST}:{DB_PORT}, Database: {DB_NAME}", file=sys.stderr)
        
        conn = pyodbc.connect(conn_str)
        print("Successfully connected to SQL Server database", file=sys.stderr)
        return conn
    except Exception as e:
        print(f"Error connecting to SQL Server database: {str(e)}", file=sys.stderr)
        return None

# Database initialization
def init_db():
    """Initialize the database by creating the shirt_orders table if it doesn't exist"""
    if USE_SQLSERVER:
        try:
            conn = get_db_connection()
            if conn is None:
                print("Could not initialize SQL Server database - connection failed", file=sys.stderr)
                return
            
            cursor = conn.cursor()
            
            # Dynamically build the CREATE TABLE statement
            column_defs = [f"{col} {type_def}" for col, type_def in TABLE_COLUMNS.items()]
            create_table_sql = f"""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '{TABLE_NAME}')
                BEGIN
                    CREATE TABLE {TABLE_NAME} (
                        {', '.join(column_defs)}
                    )
                END
            """
            
            cursor.execute(create_table_sql)
            
            conn.commit()
            conn.close()
            print("SQL Server database initialized successfully", file=sys.stderr)
        except Exception as e:
            print(f"Error initializing SQL Server database: {str(e)}", file=sys.stderr)
    else:
        print("SQL Server connection not available - using SQLite as fallback", file=sys.stderr)

# Add ShirtOrder model
class ShirtOrder(BaseModel):
    姓名: str
    身高: Optional[float] = None
    体重_KG: Optional[float] = None
    电话: Optional[str] = None
    使用时间: Optional[str] = None
    下单日期: Optional[str] = None
    到店交付日期: Optional[str] = None
    实际交付日期: Optional[str] = None
    定制工艺: Optional[str] = None
    工艺: Optional[str] = None
    西装净体领围: Optional[float] = None
    西装肩宽: Optional[float] = None
    西装袖长: Optional[float] = None
    西装袖肥: Optional[float] = None
    西装袖口: Optional[float] = None
    西装胸围: Optional[float] = None
    西装中腰: Optional[float] = None
    西装下摆臀围: Optional[float] = None
    西装前衣长: Optional[float] = None
    西装后衣长: Optional[float] = None
    西装前腰节: Optional[float] = None
    西装后腰节: Optional[float] = None
    西装左肩斜: Optional[float] = None
    西装右肩斜: Optional[float] = None
    西装背胸差: Optional[float] = None
    西装前胸宽: Optional[float] = None
    西装后背宽: Optional[float] = None
    西装袖笼差: Optional[float] = None
    西装袖笼深: Optional[float] = None
    西装袖笼围: Optional[float] = None
    西装数量: Optional[int] = None
    西裤裤腰围: Optional[float] = None
    西裤臀围: Optional[float] = None
    西裤大腿圈: Optional[float] = None
    西裤膝围: Optional[float] = None
    西裤小腿圈: Optional[float] = None
    西裤小腿高: Optional[float] = None
    西裤裤长: Optional[float] = None
    西裤遮档: Optional[float] = None
    西裤腰高: Optional[float] = None
    西裤裤前褶: Optional[str] = None
    西裤皮带袢: Optional[str] = None
    西裤卷边: Optional[str] = None
    西裤调山袢: Optional[str] = None
    西装面料: Optional[str] = None
    西裤数量: Optional[int] = None
    马甲肩宽: Optional[float] = None
    马甲胸围: Optional[float] = None
    马甲中腰肚围: Optional[float] = None
    马甲下摆: Optional[float] = None
    马甲前衣长: Optional[float] = None
    马甲后衣长: Optional[float] = None
    马甲袖肥: Optional[float] = None
    马甲袖口: Optional[float] = None
    马甲扣数: Optional[int] = None
    马甲排数: Optional[str] = None
    马甲口袋: Optional[str] = None
    马甲背面: Optional[str] = None
    马甲领子: Optional[str] = None
    马甲侧面开叉: Optional[str] = None
    马甲数量: Optional[int] = None
    衬衫领围: Optional[float] = None
    衬衫肩宽: Optional[float] = None
    衬衫袖长: Optional[float] = None
    衬衫领型: Optional[float] = None
    衬衫袖口: Optional[float] = None
    衬衫面料: Optional[str] = None
    衬衫数量: Optional[int] = None
    款式备注: Optional[str] = None
    体型备注: Optional[str] = None
    里布: Optional[str] = None
    客户来源: Optional[str] = None
    接待人员: Optional[str] = None
    定制顾问: Optional[str] = None
    定制金额: Optional[float] = None

# -------------------------
# THREE MAIN API ENDPOINTS
# -------------------------

# 1. GET shirt orders
@app.get("/api/shirt-orders")
async def get_shirt_orders():
    """Get all shirt orders"""
    if USE_SQLSERVER:
        try:
            conn = get_db_connection()
            if conn is None:
                return {
                    "success": False,
                    "message": "无法连接到数据库",
                    "orders": [],
                    "count": 0
                }
                
            cursor = conn.cursor()
            cursor.execute(f'SELECT * FROM {TABLE_NAME}')
            
            columns = [column[0] for column in cursor.description]
            orders = []
            
            for row in cursor.fetchall():
                # Convert row to dict
                order_dict = {}
                for i, value in enumerate(row):
                    order_dict[columns[i]] = value
                orders.append(order_dict)
            
            conn.close()
            return {
                "success": True,
                "orders": orders,
                "count": len(orders)
            }
        except Exception as e:
            print(f"Error fetching shirt orders from SQL Server: {str(e)}", file=sys.stderr)
            print(traceback.format_exc(), file=sys.stderr)
            return {
                "success": False,
                "message": f"获取订单失败: {str(e)}",
                "orders": [],
                "count": 0
            }
    else:
        return {
            "success": False,
            "message": "数据库连接配置不完整，请检查环境变量",
            "orders": [],
            "count": 0
        }

# 2. INSERT a new shirt order
@app.post("/api/shirt-orders")
async def create_shirt_order(order: ShirtOrder):
    """Create a new shirt order"""
    if USE_SQLSERVER:
        try:
            conn = get_db_connection()
            if conn is None:
                return {
                    "success": False,
                    "message": "无法连接到数据库"
                }
                
            cursor = conn.cursor()
            
            # Get all columns except 'id' which is auto-generated
            columns = [col for col in TABLE_COLUMNS.keys() if col != 'id']
            
            # Build SQL dynamically
            sql = f'''INSERT INTO {TABLE_NAME} (
                        {', '.join(columns)}
                    ) VALUES (
                        {', '.join(['?'] * len(columns))}
                    )'''
                    
            # Extract values in the same order as columns
            values = []
            for col in columns:
                values.append(getattr(order, col, None))
            
            cursor.execute(sql, values)
            conn.commit()
            
            # Get the ID of the new order (using SCOPE_IDENTITY())
            cursor.execute("SELECT SCOPE_IDENTITY()")
            order_id = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                "success": True,
                "message": "衬衫订单创建成功",
                "order_id": order_id
            }
        except Exception as e:
            print(f"Error creating shirt order in SQL Server: {str(e)}", file=sys.stderr)
            print(traceback.format_exc(), file=sys.stderr)
            if 'conn' in locals() and conn:
                conn.rollback()
                conn.close()
            return {
                "success": False,
                "message": f"创建订单失败: {str(e)}"
            }
    else:
        return {
            "success": False,
            "message": "数据库连接配置不完整，请检查环境变量"
        }

# 3. UPDATE/DELETE shirt orders in bulk
@app.post("/api/shirt-orders/bulk-update")
async def bulk_update_shirt_orders(request: Request):
    """Bulk update for shirt orders - handles update, create, and delete operations"""
    if not USE_SQLSERVER:
        return {
            "success": False,
            "message": "数据库连接配置不完整，请检查环境变量"
        }
        
    try:
        # Parse request body manually
        request_data = await request.json()
        
        edited_orders = request_data.get('editedOrders', [])
        new_orders = request_data.get('newOrders', [])
        deleted_orders = request_data.get('deletedOrders', [])
        
        print(f"Processing bulk update: {len(edited_orders)} edits, {len(new_orders)} new, {len(deleted_orders)} deleted", file=sys.stderr)
        
        conn = get_db_connection()
        if conn is None:
            return {
                "success": False,
                "message": "无法连接到数据库"
            }
            
        cursor = conn.cursor()
        
        # Handle deleted orders
        if deleted_orders:
            for order_id in deleted_orders:
                cursor.execute(f"DELETE FROM {TABLE_NAME} WHERE id = ?", (order_id,))
                print(f"Deleted shirt order with ID {order_id}", file=sys.stderr)
        
        # Handle edited orders
        for order in edited_orders:
            # Build update query dynamically based on provided fields
            update_fields = []
            update_values = []
            
            # Use TABLE_COLUMNS keys (except 'id') for valid field names
            valid_fields = [col for col in TABLE_COLUMNS.keys() if col != 'id']
            
            for field in valid_fields:
                if field in order and order[field] is not None:
                    update_fields.append(f"{field} = ?")
                    update_values.append(order[field])
            
            if update_fields:
                update_values.append(order['id'])
                query = f"UPDATE {TABLE_NAME} SET {', '.join(update_fields)} WHERE id = ?"
                cursor.execute(query, update_values)
                print(f"Updated shirt order {order['id']}", file=sys.stderr)
        
        # Handle new orders
        for order in new_orders:
            # Build insert query
            field_names = []
            placeholders = []
            values = []
            
            # Use TABLE_COLUMNS keys (except 'id') for valid field names
            valid_fields = [col for col in TABLE_COLUMNS.keys() if col != 'id']
            
            for field in valid_fields:
                if field in order and order[field] is not None:
                    field_names.append(field)
                    placeholders.append('?')
                    values.append(order[field])
            
            if field_names:
                query = f"INSERT INTO {TABLE_NAME} ({', '.join(field_names)}) VALUES ({', '.join(placeholders)})"
                cursor.execute(query, values)
                print(f"Inserted new shirt order", file=sys.stderr)
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Shirt orders updated successfully"
        }
    except Exception as e:
        print(f"Error in bulk update of shirt orders: {str(e)}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        if 'conn' in locals() and conn:
            conn.rollback()
            conn.close()
        return {
            "success": False,
            "message": f"Error updating shirt orders: {str(e)}"
        }

# Server info endpoint (utility)
@app.get("/api/server-info")
async def get_server_info(request: Request):
    """Endpoint to get server information for dynamic API URL construction"""
    # Always return the cloud ECS address
    return {
        "api_base_url": "http://8.153.205.171:8889",
        "client_ip": request.client.host if request.client else "unknown",
        "server_hostname": "8.153.205.171"
    }

# Home page endpoint for checking server status
@app.get("/")
async def root():
    db_status = "Connected" if USE_SQLSERVER else "Not connected"
    return {
        "message": "API Server is running", 
        "status": "ok",
        "database": db_status,
        "db_host": DB_HOST if USE_SQLSERVER else None
    }

if __name__ == "__main__":
    host_ip = get_host_ip()
    port = 8889
    
    print(f"Server will run at: http://{host_ip}:{port}")
    print(f"Server will also be available at: http://localhost:{port}")
    print(f"Starting server with host='0.0.0.0' to allow all incoming connections")
    
    # Explicitly bind to all interfaces (0.0.0.0) to ensure accessibility
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="debug") 