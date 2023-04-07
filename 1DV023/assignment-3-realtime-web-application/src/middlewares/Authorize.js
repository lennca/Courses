/**
 * Authorization middleware.
 */
const Authorize = {
  /**
   * Method that authorize Gitlab webhook token.
   *
   * @param {object} req Express request object.
   * @param {object} res Express reponse object.
   * @param {Function} next Express next middleware function.
   * @returns {Function} next Express next middleware function with error.
   */
  webhookToken(req, res, next) {
    console.log('auth')
    if (req.headers['x-gitlab-token'] !== process.env.WEBHOOK_SECRET) return res.status(401).send('Unauthorized')
    next()
  },

  /**
   * Method that validates that correct Gitlab webhook trigger event has occured.
   *
   * @param {object} req Express request object.
   * @param {object} res Express reponse object.
   * @param {Function} next Express next middleware function.
   * @returns {Function} Return next function if correct headers, else response object with status code 406.
   */
  webhookEvent(req, res, next) {
    console.log('event')
    console.log(req.headers['x-gitlab-event'])
    if (req.headers['x-gitlab-event'] === 'Issue Hook' || req.headers['x-gitlab-event'] === 'Note Hook') return next()
    return res.status(406).send('Not Acceptable')
  }
}

export default Authorize
