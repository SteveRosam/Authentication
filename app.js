require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')
const { rateLimiter } = require('./utils/rateLimiter')
 
const indexRouter = require('./routes/index')
const authRouter = require('./routes/auth')
const quixRouter = require('./routes/quix')

const PORT = 8080

const app = express()

var bodyparser = require('body-parser')
app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())
// app.use(function (req, res) {
// 	console.log(JSON.stringify(req.body, null, 2))
// })

  
app.use(rateLimiter)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/', indexRouter)
app.use('/auth', authRouter)
app.use('/quix', quixRouter)

app.listen(PORT, function () {
	console.log(`🚀 Listening on port ${PORT}`)
})
