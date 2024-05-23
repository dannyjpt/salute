import { createPool } from "mysql2/promise";

const pool = createPool({
    host: 'sql3.freesqldatabase.com',
    port: '3306',
    user: 'sql3708522',
    password: 'zzTWt1A6XP',
    database: 'sql3708522'
});

export default pool;