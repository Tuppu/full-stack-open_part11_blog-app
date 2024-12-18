import { useState } from 'react'

const Blog = ({ blog, deleteBlog, likeBlog, user }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const [visible, setVisible] = useState(false)

  const Visibility = { display: visible ? '' : 'none' }
  const DeleteVisibility = { display: (!blog.user || user?.name === blog?.user?.name) ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  return(
    <div className='blog' style={blogStyle}>
      <div>{blog.title} {blog.author} <button onClick={toggleVisibility}>{visible ? 'hide' : 'view'}</button></div>
      <div className='blogDetails' style={Visibility}>
        <div>{blog.url}</div>
        <div className='blogLikes'>{blog.likes} <button onClick={likeBlog}>like</button></div>
        <div className='blogUserName'>{blog?.user?.name}</div>
        <div><button onClick={deleteBlog} style={DeleteVisibility}>remove</button></div>
      </div>
    </div>
  )}
export default Blog