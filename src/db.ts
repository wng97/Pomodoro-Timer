import {Pool} from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "test",
  password: "abc123",
  port:5432
})

export default pool;