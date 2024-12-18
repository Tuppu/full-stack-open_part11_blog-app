import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders content', () => {
  const blog = {
    'title': 'testTitle',
    'author': 'testAuthor',
    'url': 'https://www.test.fi',
    'likes': 0
  }

  render(<Blog blog={blog} />)

  const element = screen.getByText('testTitle testAuthor')

  expect(element).toBeDefined()
})

test('after view button clicked', async () => {
  const blog = {
    'title': 'testTitle',
    'author': 'testAuthor',
    'url': 'https://www.test.fi',
    'likes': 123,
    'user': {
      'name': 'Tuomas Liikala',
    },
  }

  const { container } = render(<Blog blog={blog} />)

  const divBlogDetails = container.querySelector('.blogDetails')
  expect(divBlogDetails).toHaveStyle('display: none')

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  expect(divBlogDetails).not.toHaveStyle('display: none')

  const element = screen.getByText('testTitle testAuthor')
  expect(element).toBeDefined()

  const element2 = screen.getByText('https://www.test.fi')
  expect(element2).toBeDefined()

  const div = container.querySelector('.blogLikes')
  expect(div).toHaveTextContent('123')

  const div2 = container.querySelector('.blogUserName')
  expect(div2).toHaveTextContent('Tuomas Liikala')
})

test('after like button clicked twice', async () => {
  const blog = {
    'title': 'testTitle',
    'author': 'testAuthor',
    'url': 'https://www.test.fi',
    'likes': 123,
    'user': {
      'name': 'Tuomas Liikala',
    },
  }

  const mockHandler = vi.fn()

  render(<Blog blog={blog} likeBlog={mockHandler} />)

  const user = userEvent.setup()
  const button = screen.getByText('like')
  await user.click(button)
  await user.click(button)

  expect(mockHandler.mock.calls).toHaveLength(2)
})