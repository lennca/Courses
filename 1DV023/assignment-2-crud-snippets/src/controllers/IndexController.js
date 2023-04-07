/**
 * Controller class that handles the logic of a request to the server.
 */
export class IndexController {
  /**
   * Method that renders the index page.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   */
  index (req, res, next) {
    try {
      res.status(200).render('pages/index.ejs')
    } catch (error) {
      next(error)
    }
  }
}
