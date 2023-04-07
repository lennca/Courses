import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import Card from './components/card/Card.js'

/**
 * React App (main) component.
 *
 * @returns {HTMLElement} jsx rendered as HTML-elements.
 */
function App () {
  const [issues, setIssues] = useState([])

  const socket = useRef()

  /**
   * React function that run once when component is rendered.
   * Open connection and connect to socket.
   */
  useEffect(() => {
    socket.current = io('http://localhost:8081', { transports: ['websocket'] }) // in production - path: '/issues-app/socket.io'

    /**
     * Function that validate and set state on connection.
     *
     * @param {Array} data Array of issues
     */
    const initConnection = (data) => {
      console.log('connect to socket')
      if (data.status <= 299 && data.status >= 200) setIssues(data.issues)
    }

    socket.current.on('connection', initConnection)
    socket.current.on('error', () => socket.current.disconnect())

    return () => {
      socket.current.off('connection', initConnection)
      socket.current.disconnect()
    }
  }, [])

  /**
   * React function that run once when component is rendered.
   * Start listening on socket events.
   */
  useEffect(() => {
    /**
     * Function that add issue to state.
     *
     * @param {object} issue Object returned from server.
     */
    const addIssue = (issue) => {
      console.log('Open issue')
      issue.user_notes_count = 0
      setIssues((prevIssues) => [...prevIssues, issue])
    }

    /**
     * Function that updates issue stored in state.
     *
     * @param {object} updateIssue Issue that has been updated or have changed state.
     */
    const updateIssue = (updateIssue) => {
      setIssues((prevIssues) => {
        const newArray = [...prevIssues].map((issue) => {
          if (issue.iid === updateIssue.iid) {
            const commentCount = issue.user_notes_count
            issue = updateIssue
            issue.user_notes_count = commentCount
          }
          return issue
        })
        return newArray
      })
    }

    /**
     * Function that add comment count to specific issue stored in state.
     *
     * @param {object} note Note object with iid of issue and update property.
     */
    const addComment = (note) => {
      setIssues((prevIssues) => {
        const newArray = [...prevIssues].map((issue) => {
          if (issue.iid === note.iid) {
            issue.user_notes_count = issue.user_notes_count + 1
            issue.updated_at = note.updated_at
          }
          return issue
        })
        return newArray
      })
    }

    // When new issues is created.
    socket.current.on('open issue', addIssue)

    // When issue is updated / closed / reopened.
    socket.current.on('update issue', updateIssue)

    // When new note is made.
    socket.current.on('new note', addComment)

    return () => {
      socket.current.off('open issue', addIssue)
      socket.current.off('update issue', updateIssue)
      socket.current.off('new note', addComment)
    }
  }, [])

  /**
   * Function that handles click on button and update state of issue.
   *
   * @param {string} state State to be updated to.
   * @param {number} id Id of issue to be update.
   */
  const onClickUpdateState = async (state, id) => {
    socket.current.emit('new state', { state, id })
  }

  return (
    <div id='app' className='container d-flex'>
      <div className='container'>
        <h1>Issues:</h1>
        <ul className='list-group' id='issue-list'>
          {issues.map((issue, index) => {
            return (
              <li className='list-group-item' key={index}>
                <Card onClickUpdateState={onClickUpdateState} issue={issue} />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default App
