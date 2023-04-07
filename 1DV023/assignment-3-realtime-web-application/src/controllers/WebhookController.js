/**
 * Help function that modify issue into desired format.
 *
 * @param {object} issue Original issues returned from Webhook.
 * @returns {object} Modified issue in desired format.
 */
function modifyIssueObject(issue) {
  const { description, iid, state, title, action } = issue.object_attributes
  const { name } = issue.user
  return {
    action,
    state,
    iid,
    title,
    author: {
      avatar_url: issue.user.avatar_url,
      name
    },
    description,
    created_at: issue.object_attributes.created_at,
    updated_at: issue.object_attributes.updated_at
  }
}

/**
 * Controller class for the Webhook route.
 */
class WebhookController {
  /**
   * Endpoint of Gitlab webhook API that handles the data and emit it to the socket clients.
   *
   * @param {object} req Express request object.
   * @param {object} res Express reponse object.
   */
  create(req, res) {
    console.log('here')
    try {
      if (req.headers['x-gitlab-event'] === 'Issue Hook') {
        const action = req.body.object_attributes.action

        if (action === 'open' || action === 'reopen' || action === 'close' || action === 'update') {
          console.log('emit issue')
          const issue = modifyIssueObject(req.body)
          action === 'open' ? res.locals.io.emit(`${action} issue`, issue) : res.locals.io.emit('update issue', issue)
        }
      }

      if (req.headers['x-gitlab-event'] === 'Note Hook') {
        console.log('emit Note')
        const note = { iid: req.body.issue.iid, updated_at: req.body.issue.updated_at }
        res.locals.io.emit('new note', note)
      }

      res.status(200).end()
    } catch (error) {
      res.status(error.status).end()
    }
  }
}

export default WebhookController
