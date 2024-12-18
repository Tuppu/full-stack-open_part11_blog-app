const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogRouter.post('/', userExtractor, async (request, response) => {

  const { title, author, url, likes } = request.body

  if (!title) {
    return response.status(400).json({ error: 'missing title' })
  }
  if (!url) {
    return response.status(400).json({ error: 'missing url' })
  }

  const user = request.user

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes ?? 0,
    user: user._id
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', userExtractor, async (request, response) => {

  const user = request.user

  const blog = await Blog
    .findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'Do not found the blog to delete it' })
  }

  if ( !blog.user || blog.user.toString() === user.id.toString() ) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    return response.status(401).json({ message: 'It is not allowed to delete this resource by this user' })
  }
})

blogRouter.put('/:id', async (request, response) => {

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body,
    { new: true, runValidators: true, context: 'query' })
  response.json(updatedBlog)
})

module.exports = blogRouter