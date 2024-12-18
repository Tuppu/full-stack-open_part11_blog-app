const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    'title': 'eka',
    'author': 'YLE',
    'url': 'https://www.yle.fi',
    'likes': 1,
    'user': {
      'username': 'tuppu',
      'name': 'Tuomas Liikala',
      '_id': '66ed2ae0813500c9bb343ed7'
    },
    '_id': '66e96b86e77085528c3db195'
  },
  {
    'title': 'toka',
    'author': 'Tuomas Liikala',
    'url': 'https://www.tuppu.fi',
    'likes': 100,
    'user': {
      'username': 'root',
      'name': 'Tuomas Liikala',
      '_id': '66f12281cde3bf9dead2fa5b'
    },
    '_id': '66e96b86e77085528c3db190'
  },
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return await blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return await users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb
}