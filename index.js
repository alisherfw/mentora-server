const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/User")
const searchRoute = require("./routes/Search")
const courseRoute = require("./routes/Course")

dotenv.config()
const app = express()

app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))

// Auth route
app.use("/api/auth", authRoutes);

// Search route
app.use("/api/", searchRoute);

// User Management
app.use("/api/users", userRoutes);

// Course route
app.use("/api/courses", courseRoute)

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`) }))
    .catch(err => console.log(err))