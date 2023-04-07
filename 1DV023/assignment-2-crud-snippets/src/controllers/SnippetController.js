import mongoose from 'mongoose'
import SnippetModel from '../models/snippet.js'
import UserModel from '../models/user.js'

/**
 * Controller class that handles the logic for a request to the server with path /snippets.
 */
export class SnippetController {
  /**
   * Method that renders the snippet page.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   */
  async index (req, res, next) {
    try {
      const snippets = await SnippetModel.find({})

      const snippetTags = snippets.map((snippet) => snippet.tags)

      const tags = [...new Set(snippetTags.flat())]
      const users = [...new Set(snippets.map((snippet) => snippet.createdBy))]

      res.status(200).render('pages/snippet.ejs', {
        success: req.flash('success'),
        danger: req.flash('danger'),
        snippets,
        tags,
        users,
        csrfToken: req.csrfToken()
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Method that renders a specific snippet.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   * @returns {Function} Next function with custom error
   */
  async show (req, res, next) {
    try {
      const { id } = req.params

      const validId = mongoose.Types.ObjectId.isValid(id)

      if (!validId) {
        const error = new Error('Not Found')
        error.status = 404
        return next(error)
      }

      const snippet = await SnippetModel.findById(id)

      if (!snippet) {
        const error = new Error('Not Found')
        error.status = 404
        return next(error)
      }

      res.status(200).render('pages/readSnippet.ejs', { snippet })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Method that renders the page for creating a snippet.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   */
  new (req, res, next) {
    try {
      res.status(200).render('pages/createSnippet.ejs', {
        success: req.flash('success'),
        danger: req.flash('danger'),
        csrfToken: req.csrfToken()
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Method that creates a snippet.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   * @returns {Function} Next function with custom error
   */
  async create (req, res, next) {
    try {
      const { snippetBody, tagBody } = req.body

      if (!snippetBody) {
        req.flash('danger', 'Invalid input! Snippet (input) is missing!')
        return res.status(400).redirect(`${process.env.BASE_URL}snippets/new`)
      }

      const user = await UserModel.findById(req.session.user._id)

      if (!user) {
        const error = new Error('Not Found')
        error.status = 404
        return next(error)
      }

      const tags = tagBody.split(',').map((tag) => tag.trim()).filter((tag) => tag)

      await SnippetModel.create({
        createdBy: user.username,
        body: snippetBody,
        tags
      })

      req.flash('success', 'Snippet created successfully!')
      res.status(201).redirect(`${process.env.BASE_URL}snippets`)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Method that renders the page for editing a snippet.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   * @returns {Function} Next function with custom error
   */
  async edit (req, res, next) {
    try {
      const { id } = req.params

      const user = await UserModel.findById(req.session.user._id)

      if (!user) {
        const error = new Error('Not Found')
        error.status = 404
        return next(error)
      }

      const snippet = await SnippetModel.findById(id)

      if (snippet.createdBy !== user.username) {
        const error = new Error('Forbidden')
        error.status = 403
        return next(error)
      }

      let tagString = ''
      for (let index = 0; index < snippet.tags.length; index++) {
        const element = snippet.tags[index]
        tagString += element
        if (index !== snippet.tags.length - 1) tagString += ', '
      }

      res.status(200).render('pages/editSnippet.ejs', { tagString, snippet, csrfToken: req.csrfToken() })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Method that updates a snippet.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   * @returns {object} Response object with status and redirection depending on result
   */
  async update (req, res, next) {
    try {
      const { snippetBody, tagBody } = req.body
      const { id } = req.params

      if (!snippetBody) {
        req.flash('danger', 'Body (input) for snippet is missing!')
        return res.status(400).redirect(`${process.env.BASE_URL}snippets`)
      }

      const snippet = await SnippetModel.findById(id)
      const snippetCreater = snippet.createdBy

      const user = await UserModel.findById(req.session.user._id)

      if (!user) {
        const error = new Error('Not Found')
        error.status = 404
        return next(error)
      }

      if (user.username !== snippetCreater) {
        const error = new Error('Forbidden')
        error.status = 403
        return next(error)
      }

      const tags = tagBody.split(',').map((tag) => tag.trim()).filter((tag) => tag)

      snippet.body = snippetBody
      snippet.tags = tags
      await snippet.save()

      req.flash('success', 'Snippet successfully updated!')
      return res.status(201).redirect(`${process.env.BASE_URL}snippets`)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Method that delete a snippet.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   * @returns {object} response object with status and message depending on result
   */
  async delete (req, res, next) {
    try {
      const { id } = req.params
      const snippet = await SnippetModel.findById(id)
      const snippetCreater = snippet.createdBy

      const user = await UserModel.findById(req.session.user._id)

      if (!user) {
        const error = new Error('Not Found')
        error.status = 404
        return next(error)
      }

      if (user.username !== snippetCreater) {
        const error = new Error('Forbidden')
        error.status = 403
        return next(error)
      }

      await SnippetModel.deleteOne({ _id: snippet._id })

      req.flash('success', 'Snippet successfully deleted!')
      res.status(201).redirect(`${process.env.BASE_URL}snippets`)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Method that handle post request for filtered tags or users.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   */
  async postFilter (req, res, next) {
    try {
      res.redirect(`${process.env.BASE_URL}snippets/${req.params.type}/${req.body.selectTag}`)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Method that renders the snippet page filtered on condition.
   *
   * @param {object} req Express request object
   * @param {object} res Express response object
   * @param {Function} next Express next middleware function
   */
  async filtered (req, res, next) {
    try {
      const { id, type } = req.params
      const snippets = await SnippetModel.find({})

      const snippetTags = snippets.map((snippet) => snippet.tags)
      const tags = [...new Set(snippetTags.flat())]
      const users = [...new Set(snippets.map((snippet) => snippet.createdBy))]

      let snippetsMatchTag
      if (type === 'tag') {
        snippetsMatchTag = snippets.map((snippet) => {
          if (snippet.tags.includes(`${id}`)) return snippet
          return undefined
        })
      } else if (type === 'user') {
        snippetsMatchTag = snippets.map((snippet) => {
          if (snippet.createdBy === id) return snippet
          return undefined
        })
      }

      snippetsMatchTag = snippetsMatchTag.filter((snippet) => snippet !== undefined)

      res.status(200).render('pages/snippet.ejs', {
        success: req.flash('success'),
        danger: req.flash('danger'),
        snippets: snippetsMatchTag,
        tags,
        users,
        csrfToken: req.csrfToken()
      })
    } catch (error) {
      next(error)
    }
  }
}
