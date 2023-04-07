import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Error handling middleware that send correct error file on error. (Inspired from exercise Follow The Route).
 *
 * @param {object} err Express error object.
 * @param {object} req Express request object.
 * @param {object} res Express reponse object.
 * @param {Function} next Express middleware next function.
 * @returns {object} Express response object with status code and send file.
 */
const ErrorHandling = (err, req, res, next) => {
  try {
    if (err.status === 404) return res.status(404).sendFile(join(__dirname, '../views', 'errors/404.html'))

    // 500 Internal Server Error (in production, all other errors send this response).
    if (req.app.get('env') !== 'development') return res.status(500).sendFile(join(__dirname, '../views', 'errors/500.html'))
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

export default ErrorHandling
