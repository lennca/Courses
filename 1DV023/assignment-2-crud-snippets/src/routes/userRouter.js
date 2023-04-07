import express from 'express'
import { UserController } from '../controllers/UserController.js'
import authenticate from '../middleware/authenticate.js'
import csrf from 'csurf'
const csrfProtection = csrf()

const userController = new UserController()
const router = express.Router()

router.use(csrfProtection)
router.get('/new', authenticate.forward, userController.new)
router.post('/create', authenticate.forward, userController.create)

export default router
