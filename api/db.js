import mysql from "mysql2"; // mysql doesn't support this new default authentication method of MySQL 8, so always ues mysql2

export const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"2411",
    database:"blog"
})