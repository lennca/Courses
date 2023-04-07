const PORT = process.env.PORT || 8081

// Helmet configuration.
const HelmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", 'https://secure.gravatar.com'],
      scriptSrc: ["'self'",
        'https://code.jquery.com/jquery-3.5.1.slim.min.js',
        'https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js',
        'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.min.js'
      ],
      styleSrc: ["'self'", 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'],
      connectSrc: ["'self'", `wss://localhost:${PORT}`]
    }
  }
}

export default HelmetConfig
