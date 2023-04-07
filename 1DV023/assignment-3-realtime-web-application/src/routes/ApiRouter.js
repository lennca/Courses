import express from 'express'
import ApiController from '../controllers/ApiController.js'

const Router = express.Router()

const apiController = new ApiController()

Router.put('/:state/:id', apiController.update)

export default Router
