import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import foodRouter from './routes/foodRoute.js'
import userRouter from './routes/userRoute.js'

import 'dotenv/config'

import fs from "fs"

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads")
}

//APP CONFIG
const app=express()
const port = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


//MIDDLEWARE
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
app.use("/api/user",userRouter)


//db connection
connectDB()





app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get("/api", (req, res) => {
    res.send("API WORKING...")
})

//API Endpoint
app.use('/api/food',foodRouter)

app.use('/images',express.static('uploads'))



app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})