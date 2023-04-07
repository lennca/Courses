import express from 'express'
import WebhookRouter from './WebhookRouter.js'
import ApiRouter from './ApiRouter.js'

const Router = express.Router()

Router.use('/webhook', WebhookRouter)
Router.use('/api', ApiRouter)
Router.use('*', (req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

export default Router
