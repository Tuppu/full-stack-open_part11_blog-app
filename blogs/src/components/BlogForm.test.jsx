import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test('<BlogForm /> updates parent state and calls onSubmit', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()

  render(<BlogForm createNewBlog={createBlog} />)

  const inputTitle = screen.getByPlaceholderText('title')
  const inputAuthor = screen.getByPlaceholderText('author')
  const inputUrl = screen.getByPlaceholderText('url')
  const sendButton = screen.getByText('create')

  await user.type(inputTitle, 'testing a form title')
  await user.type(inputAuthor, 'testing a form author')
  await user.type(inputUrl, 'testing a form url')
  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('testing a form title')
  expect(createBlog.mock.calls[0][0].author).toBe('testing a form author')
  expect(createBlog.mock.calls[0][0].url).toBe('testing a form url')
})