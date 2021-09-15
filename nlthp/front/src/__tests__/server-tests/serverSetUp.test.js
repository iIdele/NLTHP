import '@testing-library/jest-dom/extend-expect'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import "regenerator-runtime/runtime"
import Fetch from '../../fetch'


const server = setupServer(
    rest.get('/connection', (req, res, ctx) => {
        return res(ctx.json({ connection: 'Connected' }))
    })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('loads and displays connection successful', async () => {
    render(<Fetch url="/connection" />)

    fireEvent.click(screen.getByText('Connection Established Successfully'))

    await waitFor(() => screen.getByRole('heading'))

    expect(screen.getByRole('heading')).toHaveTextContent('Connected')
    expect(screen.getByRole('button')).toHaveAttribute('disabled')
})

test('handles server error', async () => {
    server.use(
        rest.get('/connection', (req, res, ctx) => {
            return res(ctx.status(500))
        })
    )

    render(<Fetch url="/connection" />)

    fireEvent.click(screen.getByText('Connection Established Successfully'))

    await waitFor(() => screen.getByRole('alert'))

    expect(screen.getByRole('alert')).toHaveTextContent('Oops, failed to fetch!')
    expect(screen.getByRole('button')).not.toHaveAttribute('disabled')
})