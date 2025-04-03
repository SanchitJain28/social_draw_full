import express from 'express'
import { router as Authentication } from './routes/Authentication.js'
import { router as Drawing } from './routes/Drawing.js'
 import cookieParser from 'cookie-parser'
 import cors from 'cors'
import { RunDatabase } from './database.js'
 
 RunDatabase()
 const app = express()
 app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
 }))
 app.use(cookieParser())
 app.use(express.json()); // Add this line to parse JSON request bodies
 app.use(express.urlencoded({ extended: true })); // Optional: for form data
 app.use(Authentication)
app.use(Drawing) 
 const port = 3000
 
 app.get('/', (req, res) => {
   res.send('Hello World!')
 })
 
 app.listen(port, () => {
   console.log(`Example app listening on port ${port}`)
 })