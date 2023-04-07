import express from 'express'
import dotenv from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { Server } from 'socket.io'
import http from 'http'
import axios from 'axios'
import helmet from 'helmet'
import Router from './routes/Router.js'
import ErrorHandling from './middlewares/ErrorHandling.js'
import HelmetConfig from './config/HelmetConfig.js'

dotenv.config()

/**
 * Server start function for application.
 */
const main = () => {
  const { PRIVATE_TOKEN, PROJECT_ID } = process.env
  const PORT = process.env.PORT || 8081

  const __dirname = dirname(fileURLToPath(import.meta.url))

  const app = express()
  const server = http.createServer(app)
  const io = new Server(server)

  // Custom middlewares
  app.use(helmet(HelmetConfig))
  app.use(express.json())
  app.use(express.static(join(__dirname, 'public'), { extensions: ['html', 'ico'] }))

  app.use(function (req, res, next) {
    res.locals.io = io
    next()
  })

  /**
   * Function that takes an array of issues and modify them into desired format.
   *
   * @param {Array} issuesArray Original array of issues gotten from API
   * @returns {Array} Modified array in desired format
   */
  function modifyIssueObject (issuesArray) {
    const modifiedArray = issuesArray.map((issue) => {
      return {
        state: issue.state,
        iid: issue.iid,
        title: issue.title,
        author: {
          avatar_url: issue.author.avatar_url,
          name: issue.author.name
        },
        description: issue.description,
        user_notes_count: issue.user_notes_count,
        created_at: issue.created_at,
        updated_at: issue.updated_at
      }
    })
    return modifiedArray
  }

  io.on('connection', async (socket) => {
    // fetch content from Gitlab API and emit through socket io.
    try {
      const url = `https://gitlab.lnu.se/api/v4/projects/${PROJECT_ID}/issues?private_token=${PRIVATE_TOKEN}`
      const result = await axios.get(url)

      const filteredResult = modifyIssueObject(result.data)
      socket.emit('connection', { status: 200, issues: filteredResult })
    } catch (error) {
      socket.emit('connection', { status: 401, message: 'Error. Failed to fetch issues', issues: [] })
    }

    socket.on('new state', async (data) => {
      await axios.put(`http://localhost:${PORT}/api/${data.state}/${data.id}`)
    })

    socket.on('error', () => { socket.disconnect() })
  })

  app.use('/', Router)

  // Use error handling
  app.use(ErrorHandling)

  server.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
}

main()
