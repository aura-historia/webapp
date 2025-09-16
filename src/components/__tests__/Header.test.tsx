import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Header from '../Header'

// Mock the Link component from TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  )
}))

describe('Header', () => {
  it('should render all navigation links', () => {
    render(<Header />)

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start - Server Functions' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start - API Request' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Simple Form' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Address Form' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'TanStack Query' })).toBeInTheDocument()
  })

  it('should have proper CSS classes for styling', () => {
    render(<Header />)

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('p-2', 'flex', 'gap-2', 'bg-white', 'text-black', 'justify-between')
  })

  it('should render navigation within a nav element', () => {
    render(<Header />)

    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveClass('flex', 'flex-row')
  })

  it('should have bold font styling on links', () => {
    render(<Header />)

    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink.parentElement).toHaveClass('font-bold')
  })

  it('should have correct href attributes for links', () => {
    render(<Header />)

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Simple Form' })).toHaveAttribute('href', '/demo/form/simple')
    expect(screen.getByRole('link', { name: 'TanStack Query' })).toHaveAttribute('href', '/demo/tanstack-query')
  })
})
