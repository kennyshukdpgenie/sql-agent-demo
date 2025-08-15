import { Connection, ConnectionConfig, Request, TYPES } from 'tedious';

const dbConfig: ConnectionConfig = {
  server: 'rm-uf6am28eh5qt2naa7.sqlserver.rds.aliyuncs.com',
  options: {
    database: 'shirt_order_test',
    port: 3433,
    trustServerCertificate: true,
    encrypt: true
  },
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'your_username',
      password: process.env.DB_PASSWORD || 'your_password'
    }
  }
};

export const createDbConnection = (): Promise<Connection> => {
  return new Promise((resolve, reject) => {
    const connection = new Connection(dbConfig);
    
    connection.on('connect', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(connection);
    });

    connection.connect();
  });
};

export const executeQuery = (connection: Connection, query: string, parameters: any[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    let rowData: any[] = [];

    const request = new Request(query, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rowData);
    });

    request.on('row', (columns) => {
      const row: any = {};
      columns.forEach((column) => {
        row[column.metadata.colName] = column.value;
      });
      rowData.push(row);
    });

    // Add parameters to the request
    parameters.forEach((param, index) => {
      if (typeof param === 'number') {
        request.addParameter(`param${index}`, TYPES.Decimal, param);
      } else if (param instanceof Date) {
        request.addParameter(`param${index}`, TYPES.DateTime, param);
      } else {
        request.addParameter(`param${index}`, TYPES.NVarChar, param);
      }
    });

    connection.execSql(request);
  });
}; 