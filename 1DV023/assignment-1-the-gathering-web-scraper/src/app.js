/**
 * Start point of the application.
 *
 * @author ?
 */

import Application from './Application.js'

/**
 * The start and main function of the application.
 */
const app = async () => {
  const [,, url] = process.argv

  const application = new Application()
  await application.start(url)
}

app()
