import UserModel from '../models/user.js'
import bcrypt from 'bcrypt'

/**
 * Controller class that handles the logic for a request to the server with path /sessions.
 */
export class SessionController {
  /**
   * Method that renders the login page.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   */
  new (req, res, next) {
    try {
      res.render('pages/login.ejs', {
        success: req.flash('success'),
        danger: req.flash('danger'),
        csrfToken: req.csrfToken()
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Method that creates a session.
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
        req.flash('danger', 'Invalid credential(s). Please try again!')
        return res.status(401).redirect(`${process.env.BASE_URL}sessions/new`)
      }

      const user = await UserModel.findOne({ username })

      if (!user) {
        req.flash('danger', 'Invalid credential(s). Please try again!')
        return res.status(401).redirect(`${process.env.BASE_URL}sessions/new`)
      }

      const match = await bcrypt.compare(password, user.password)

      if (!match) {
        req.flash('danger', 'Invalid credential(s). Please try again!')
        return res.status(401).redirect(`${process.env.BASE_URL}sessions/new`)
      }

      req.session.regenerate(() => {
        req.session.user = user
        req.flash('success', 'Login succeeded, Welcome!')
        return res.status(201).redirect(`${process.env.BASE_URL}snippets`)
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Method that delete a session.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   */
  delete (req, res, next) {
    try {
      req.session.destroy()
      res.redirect(`${process.env.BASE_URL}`)
    } catch (error) {
      next(error)
    }
  }
}
