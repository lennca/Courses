import './Card.css'

/**
 * Card component for frontend.
 *
 * @param {object} param0 Destruction prop.
 * @param {object} param0.issue Issue passed from App component.
 * @param {Function} param0.onClickUpdateState Function passed from App component to close or reopen issue.
 * @returns {HTMLElement} elem
 */
function Card ({ issue, onClickUpdateState }) {
  return (
    <div className="card" data-id={issue.iid}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between">
          <h5>{issue.title}</h5>
          <div className="d-flex">
            <p className="mr-3">{issue.state.toUpperCase()}</p>
            <p>
              <span className="mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chat-right" viewBox="0 0 16 16">
                <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1H2zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12z"/>
              </svg>
              </span>{issue.user_notes_count}</p>
          </div>
        </div>
        <div>
          <p>{issue.description}</p>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <p className="mr-2">#{issue.iid}</p>
            <p className="mr-2">created {issue.created_at.slice(0, 10)}</p>
            <p>by <span><img src={issue.author.avatar_url} alt="profile img" /></span>{issue.author.name}</p>
          </div>
          <div>
            <p>updated {issue.updated_at.slice(0, 10)}</p>
          </div>
        </div>
        <div>
          {issue.state === 'opened'
            ? (
            <button type="button" className="btn btn-outline-warning" onClick={() => onClickUpdateState('close', issue.iid)}>Close</button>
              )
            : (
              <button type="button" className="btn btn-outline-secondary" onClick={() => onClickUpdateState('reopen', issue.iid)}>Reopen</button>
              )
          }
        </div>
      </div>
    </div>
  )
}

export default Card
