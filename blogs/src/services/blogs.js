import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const setToken = newToken => {
  token = `Bearer ${newToken}`
}

const getToken = () => {
  if (!token) {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    const user = JSON.parse(loggedUserJSON)
    setToken(user.token)
  }
  return token
}

const getAll = async () => {
  const request = await axios.get(baseUrl)
  return request.data
}

const create = async newObject => {

  const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
  if (loggedUserJSON) {
    const user = JSON.parse(loggedUserJSON)
    setToken(user.token)
  }
  const config = {
    headers: { Authorization: getToken() },
  }

  const request = await axios.post(baseUrl, newObject, config)
  return request.data
}

const update = async (updateObject, id) => {
  const config = {
    headers: { Authorization: getToken() },
  }

  const request = await axios.put(`${baseUrl}/${id}`, updateObject, config)
  return request.data
}

const remove = async (id) => {
  const config = {
    headers: { Authorization: getToken() },
  }

  const request = await axios.delete(`${baseUrl}/${id}`, config)
  return request.data
}

export default { getAll, setToken, create, update, remove }