import { createPool } from "mysql2/promise";

const pool = createPool({
    host: 'sql3.freesqldatabase.com',
    port: '3306',
    user: 'sql3708522',
    password: 'zzTWt1A6XP',
    database: 'sql3708522'
}); 

/*
const pool = createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'salutedb'
});*/

export default pool;