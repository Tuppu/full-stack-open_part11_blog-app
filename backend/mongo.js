const logger = require('./utils/logger')
const config = require('./utils/config')

const blogMongoose = require('mongoose')

if (process.argv.length === 3) {
  logger.info('give author as argument')
  process.exit(1)
} else if (process.argv.length === 4) {
  logger.info('give url as argument')
  process.exit(1)
} else if (process.argv.length === 5) {
  logger.info('give likes as argument')
  process.exit(1)
} else if (process.argv.length > 6) {
  logger.info('too many arguments')
  process.exit(1)
}

const password = config.MONGODB_PW

const url = `mongodb+srv://tuppu88:${password}@cluster0.d0qjp.mongodb.net/testblogApp?retryWrites=true&w=majority`

blogMongoose.set('strictQuery', false)

blogMongoose.connect(url).then(() => {
  const blogSchema = new blogMongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
  })

  const Blog = blogMongoose.model('Blog', blogSchema)

  if (process.argv.length < 3) {
    Blog.find({}).then(result => {
      logger.info('blogs:')
      result.forEach(blog => {
        logger.info(blog)
      })
      blogMongoose.connection.close()
      process.exit(0)
    })
  } else if (process.argv.length === 6) {
    const title = process.argv[2]
    const author = process.argv[3]
    const url = process.argv[4]
    const likes = process.argv[5]

    const newBlog = new Blog({
      title,
      author,
      url,
      likes
    })

    newBlog.save().then(result => {
      logger.info(`added ${result.title} to blogs`)
      logger.info(result)
      blogMongoose.connection.close()
    })
  }
})