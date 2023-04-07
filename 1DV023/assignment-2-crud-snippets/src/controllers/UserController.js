import bcrypt from 'bcrypt'
import UserModel from '../models/user.js'

/**
 * Controller class that handles the logic for a request to the server with path /users.
 */
export class UserController {
  /**
   * Method that renders the page for signing up.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   */
  new (req, res, next) {
    try {
      res.status(200).render('pages/registration.ejs', {
        success: req.flash('succees'),
        danger: req.flash('danger'),
        csrfToken: req.csrfToken()
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Method that creates a user.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   * @returns {object} Response object with status and redirection depending on result
   */
  async create (req, res, next) {
    try {
      const { username, password } = req.body

      if (!username || !password) {
        req.flash('danger', 'Invalid input! Username or/and password missing!')
        return res.status(401).redirect(`${process.env.BASE_URL}users/new`)
      }

      if (password.length < 8) {
        req.flash('danger', 'Password must be at least 8 characters long!')
        return res.status(401).redirect(`${process.env.BASE_URL}users/new`)
      }

      const queryUser = await UserModel.findOne({ username })

      if (queryUser) {
        req.flash('danger', 'An account with that username already exists!')
        return res.status(400).redirect(`${process.env.BASE_URL}users/new`)
      }

      // Encrypt the password
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      await UserModel.create({ username, password: hashedPassword })

      req.flash('success', 'Account created successfully!')
      res.status(201).redirect(`${process.env.BASE_URL}sessions/new`)
    } catch (error) {
      next(error)
    }
  }
}
