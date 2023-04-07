import express from 'express'
import session from 'express-session'
import flash from 'connect-flash'
import dotenv from 'dotenv'
import helmet from 'helmet'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/mongoose.js'
import router from './routes/router.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 8080

/**
 * Function that call mongoose-module and establish connection.
 * Exit application if connection fail.
 */
const mongoConnect = async () => {
  try {
    await connectDB()
  } catch (error) {
    console.log(error.message)
    process.exitCode = 1
  }
}
mongoConnect()

// Store directory name (of current file)
const __dirname = dirname(fileURLToPath(import.meta.url))

// Set view engine and path to view engine
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

app.set('trust proxy', 1)

// Route middleware
app.use(helmet())
// Helmet configure to allow bootstrap cdn
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'code.jquery.com/jquery-3.4.1.slim.min.js',
      'cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js',
      'stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js'
    ],
    styleSrc: ["'self'", 'stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css']
  }
}))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../public')))

// Create express session
const sessionConfig = {
  name: process.env.SESSION_NAME,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}
app.use(session(sessionConfig))
app.use(flash())

// Set local variable of the user
app.use(function (req, res, next) {
  if (req.session.user) res.locals.user = req.session.user
  next()
})

app.use('/', router)

// Error handling (Inspired from exercise Follow The Route)
app.use(function (err, req, res, next) {
  if (err.status === 404) {
    return res
      .status(404)
      .sendFile(join(__dirname, 'views', 'errors', '404.html'))
  }

  if (err.status === 403) {
    return res
      .status(403)
      .sendFile(join(__dirname, 'views', 'errors', '403.html'))
  }

  // 500 Internal Server Error (in production, all other errors send this response).
  if (req.app.get('env') !== 'development') {
    return res
      .status(500)
      .sendFile(join(__dirname, 'views', 'errors', '500.html'))
  }

  // Development only!
  // Only providing detailed error in development.

  // Render the error page.
  res
    .status(err.status || 500)
    .render('errors/error.ejs', { error: err })
})

app.listen(PORT, () => console.log(`Server listen to port ${PORT}`))
