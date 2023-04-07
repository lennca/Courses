import express from 'express'
import { SnippetController } from '../controllers/SnippetController.js'
import authenticate from '../middleware/authenticate.js'
import csrf from 'csurf'
const csrfProtection = csrf()

const snippetController = new SnippetController()
const router = express.Router()

router.get('/', csrfProtection, snippetController.index)
router.post('/filter/:type', csrfProtection, snippetController.postFilter)
router.get('/new', authenticate.ensure, csrfProtection, snippetController.new)
router.post('/create', authenticate.ensure, csrfProtection, snippetController.create)
router.get('/:id', snippetController.show)
router.get('/:id/edit', authenticate.ensure, csrfProtection, snippetController.edit)
router.post('/:id/update', authenticate.ensure, csrfProtection, snippetController.update)
router.get('/:id/delete', authenticate.ensure, snippetController.delete)
router.get('/:type/:id', csrfProtection, snippetController.filtered)

export default router
