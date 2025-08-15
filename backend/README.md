# Suit CRM Backend

This is the backend server for the Suit CRM application, handling order submission, retrieval, and analytics.

## Setup

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Start the server:
```
python main.py
```

## API Endpoints

The backend server runs on port 8889 and provides the following endpoints:

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create a new order
- `POST /api/order-submit` - Alternative endpoint for order submission (CLI/direct JSON)
- `PUT /api/orders/{order_id}` - Update an existing order
- `GET /api/server-info` - Get server information

## Database

The application uses a SQLite database (`suit_store.db`) for local storage, and can also connect to a 
Microsoft SQL Server database if properly configured.

## Deployment

For production deployment, you can use uWSGI with the provided uwsgi.ini configuration file.

## Architecture

The backend follows a unified approach with all API functionality consolidated in a single file (`main.py`). 
This simplifies maintenance and ensures consistent behavior across all endpoints.

- Order submission attempts to use the database_handler module for SQL Server storage first
- Falls back to SQLite storage if SQL Server is unavailable
- Returns success if either database insertion succeeds

## Modules

- `main.py` - The main FastAPI application containing all API endpoints and core functionality
- `database_handler.py` - Module for SQL Server database operations
- `test_connection.py` - Utility for testing database connectivity 