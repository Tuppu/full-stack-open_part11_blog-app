const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')
morgan('tiny')
morgan.token('res-body', function (req, res)
{
  if (req.body && res.statusCode < 400) {
    return JSON.stringify(req.body)
  }
})
const morgan_logger = morgan(':method :url :status :res[content-length] - :response-time ms - :res-body')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
const errorHandler = (error, request, response, next) => {
  logger.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(403).send({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(400).json({ error: 'token missing or invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)
}

const userExtractor = async (request, response, next) => {
  const authorization = request.get('authorization')

  if (!authorization) {
    return response.status(401).json({ message: 'Authorization token is required.' })
  }

  if (authorization && authorization.startsWith('Bearer ')) {
    try {
      const token = authorization.replace('Bearer ', '')
      const decoded = jwt.verify(token, process.env.SECRET)
      request.user = await User.findById(decoded.id)
    } catch {
      return response.status(401).json({ message: 'Invalid token.' })
    }
  }
  next()
}

module.exports = {
  morgan_logger,
  unknownEndpoint,
  errorHandler,
  userExtractor
}