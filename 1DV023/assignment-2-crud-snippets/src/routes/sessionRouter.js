import express from 'express'
import { SessionController } from '../controllers/SessionController.js'
import authenticate from '../middleware/authenticate.js'
import csrf from 'csurf'
const csrfProtection = csrf()

const sessionController = new SessionController()
const router = express.Router()

router.get('/new', authenticate.forward, csrfProtection, sessionController.new)
router.post('/create', authenticate.forward, csrfProtection, sessionController.create)
router.get('/delete', authenticate.ensure, sessionController.delete)

export default router
