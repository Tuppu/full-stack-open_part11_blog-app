const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root2', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const newUser = {
      username: 'tuppuNew',
      name: 'Tuomas Liikala',
      password: 'salainen',
      blogs: [],
    }

    const usersAtStart = await api
      .get('/api/users')

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await api
      .get('/api/users')

    assert.strictEqual(usersAtEnd.body.length, usersAtStart.body.length + 1)

    const usernames = usersAtEnd.body.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const newUser = {
      username: 'root2',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(409)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('username already exists'))
  })

  test('creation fails with proper statuscode and message if password is less than 3 characters', async () => {
    const newUser = {
      username: 'userNewbie',
      name: 'User Newbie',
      password: 'sa',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('password minimum length is 3 characters'))
  })
})

after(async () => {
  await mongoose.connection.close()
})