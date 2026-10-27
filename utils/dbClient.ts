import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

export async function executeQuery<T extends RowDataPacket[] = RowDataPacket[]>(
  sql: string,
  params: (string | number | Date | null)[] = [],
): Promise<T> {
  const { DB_HOST, DB_USER, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error('DB_HOST, DB_USER, and DB_NAME must be set to execute database queries.');
  }

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    user: DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB_NAME,
  });

  try {
    const [result] = await connection.execute(sql, params);
    return result as T;
  } finally {
    await connection.end();
  }
}
