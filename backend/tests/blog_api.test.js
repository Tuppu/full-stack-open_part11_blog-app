const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test.helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

let loggedInUserToken = null
let userForToken = null

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)

    await User.deleteMany({})
    //const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
      _id: '66f12281cde3bf9dead2fa5b',
      username: 'root',
      passwordHash: '$2b$10$uhhOAl8/mcYzaFhQoxMkKuLzQLBqFN9BcH2hdI.l.t4/M5QBasvdW',
      blogs: [],
      __v: 0
    })
    await user.save()

    userForToken = {
      username: user.username,
      id: user._id,
    }

    loggedInUserToken = 'Bearer ' + jwt.sign(userForToken, process.env.SECRET)
  })

  test('blogs are returned as json', async () => {

    await api
      .get('/api/blogs')
      .set('Authorization', loggedInUserToken)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {

    const response = await api.get('/api/blogs')
      .set('Authorization', loggedInUserToken)

    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('blog has an "id" field', async () => {
    const response = await api.get('/api/blogs')
      .set('Authorization', loggedInUserToken)

    const containsOnlyCorrectIdKey = response.body.some(blog => {
      return ('id' in blog && !('_id' in blog))
    })

    assert.strictEqual(containsOnlyCorrectIdKey, true)
  })

  describe('Addication of a new blog', () => {
    test('a valid blog can be added', async () => {
      const newBlog = {
        'title': 'FSO',
        'author': 'Helsingin yliopisto, Houston Inc., etc.',
        'url': 'https://www.fullstackopen.com',
        'likes': 11
      }

      await api
        .post('/api/blogs')
        .set('Authorization', loggedInUserToken)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs')
        .set('Authorization', loggedInUserToken)

      const foundUrl = response.body.map(r => r.url)

      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

      assert(foundUrl.includes('https://www.fullstackopen.com'))
    })

    test('an invalid blog that missing a likes', async () => {
      const newBlog = {
        'title': 'FSO',
        'author': 'Helsingin yliopisto, Houston Inc., etc.',
        'url': 'https://www.fullstackopen.com'
      }

      await api
        .post('/api/blogs')
        .set('Accept', 'application/json')
        .set('Authorization', loggedInUserToken)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs')
        .set('Authorization', loggedInUserToken)

      const foundLikes = response.body.map(r => r.likes)

      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
      assert.strictEqual(foundLikes[response.body.length-1], '0')
    })

    test('an invalid blog that missing a url', async () => {
      const newBlog = {
        'title': 'FSO',
        'author': 'Helsingin yliopisto, Houston Inc., etc.',
        'likes': 11
      }

      await api
        .post('/api/blogs')
        .set('Authorization', loggedInUserToken)
        .send(newBlog)
        .expect(400)
    })

    test('an invalid blog that missing a title', async () => {
      const newBlog = {
        'author': 'Helsingin yliopisto, Houston Inc., etc.',
        'url': 'https://www.fullstackopen.com',
        'likes': 11
      }

      await api
        .post('/api/blogs')
        .set('Authorization', loggedInUserToken)
        .send(newBlog)
        .expect(400)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', loggedInUserToken)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const foundIds = blogsAtEnd.map(r => r.id)
      assert(!foundIds.includes(blogToDelete.id))
    })
  })

  describe('updation of a blog', () => {
    test('set new likes', async () => {
      const initialId = helper.initialBlogs[0]._id

      const updateBlog = {
        'likes': 1
      }

      const response = await api
        .put(`/api/blogs/${initialId}`,updateBlog)
        .set('Authorization', loggedInUserToken)
        .send(updateBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, '1')
    })

    test('set missing likes', async () => {
      const initialId = helper.initialBlogs[0]._id

      const updateBlog = {
        'likes': null
      }

      await api
        .put(`/api/blogs/${initialId}`,updateBlog)
        .set('Authorization', loggedInUserToken)
        .send(updateBlog)
        .expect(403)
    })

    test('set missing title', async () => {
      const initialId = helper.initialBlogs[0]._id

      const updateBlog = {
        'title': null
      }

      await api
        .put(`/api/blogs/${initialId}`,updateBlog)
        .set('Authorization', loggedInUserToken)
        .send(updateBlog)
        .expect(403)
    })

    test('set missing author', async () => {
      const initialId = helper.initialBlogs[0]._id

      const updateBlog = {
        'author': null
      }

      const response = await api
        .put(`/api/blogs/${initialId}`,updateBlog)
        .set('Authorization', loggedInUserToken)
        .send(updateBlog)
        .expect(200).expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.author, null)
    })

    test('set missing url', async () => {
      const initialId = helper.initialBlogs[0]._id

      const updateBlog = {
        'url': null
      }

      await api
        .put(`/api/blogs/${initialId}`,updateBlog)
        .set('Authorization', loggedInUserToken)
        .send(updateBlog)
        .expect(403)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})