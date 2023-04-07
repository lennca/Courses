import express from 'express'
import WebhookController from '../controllers/WebhookController.js'
import Authorize from '../middlewares/Authorize.js'

const Router = express.Router()

const webhookController = new WebhookController()

Router.post('/', Authorize.webhookToken, Authorize.webhookEvent, webhookController.create)

export default Router
