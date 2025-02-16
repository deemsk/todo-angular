import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
    host: process.env['DATABASE_HOST'] || 'localhost',
    port: Number(process.env['DATABASE_PORT']) || 5432,
    user: process.env['POSTGRES_USER'] || 'appuser',
    password: process.env['POSTGRES_PASSWORD'] || 'todoAppAngular123',
    database: process.env['POSTGRES_DB'] || 'app',
});
