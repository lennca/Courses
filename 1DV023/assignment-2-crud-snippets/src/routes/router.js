import express from 'express'
import { IndexController } from '../controllers/IndexController.js'
import snippetRouter from './snippetRouter.js'
import sessionRouter from './sessionRouter.js'
import userRouter from './userRouter.js'

const indexController = new IndexController()
const router = express.Router()

router.get('/', (req, res) => indexController.index(req, res))
router.use('/snippets', snippetRouter)
router.use('/sessions', sessionRouter)
router.use('/users', userRouter)

router.use('*', (req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

export default router
