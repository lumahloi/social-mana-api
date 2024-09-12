import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { create } from '../controllers/UserController'

dotenv.config()


const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
        host: process.env.HOST,
        port: process.env.PORT,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
      })
      return connection
    } catch (err) {
      console.error('Error connecting to the database:', err)
      throw err
    }
}

export default createConnection