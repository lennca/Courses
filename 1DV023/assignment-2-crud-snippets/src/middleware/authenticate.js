const authenticate = {
  /**
   * Authenticate method to ensure that the user is signed in.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   */
  ensure (req, res, next) {
    if (req.session.user) {
      next()
    } else {
      const error = new Error('Not Found')
      error.status = 404
      next(error)
    }
  },

  /**
   * Authenticate method to ensure that the user is NOT signed in.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   */
  forward (req, res, next) {
    if (req.session.user) {
      const error = new Error('Not Found')
      error.status = 404
      next(error)
    } else {
      next()
    }
  }
}

export default authenticate
