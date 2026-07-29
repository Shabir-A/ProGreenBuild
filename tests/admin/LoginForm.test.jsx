// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const login = vi.fn();

vi.mock('../../app/admin/actions', () => ({ login: (...args) => login(...args) }));

const LoginForm = (await import('../../app/admin/LoginForm.js')).default;

beforeEach(() => {
    login.mockReset().mockResolvedValue({ error: null });
});

describe('LoginForm', () => {
    it('renders email and password fields', () => {
        render(<LoginForm />);

        expect(screen.getByRole('heading', { name: /admin login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeRequired();
        expect(screen.getByLabelText(/password/i)).toBeRequired();
        expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
    });

    it('submits the credentials to the login action', async () => {
        const user = userEvent.setup();
        render(<LoginForm />);

        await user.type(screen.getByLabelText(/email/i), 'admin@progreenbuild.test');
        await user.type(screen.getByLabelText(/password/i), 'secret');
        await user.click(screen.getByRole('button', { name: 'Sign in' }));

        await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
        const formData = login.mock.calls[0][1];
        expect(formData.get('email')).toBe('admin@progreenbuild.test');
        expect(formData.get('password')).toBe('secret');
    });

    it('shows the error returned by the action', async () => {
        login.mockResolvedValue({ error: 'Invalid email or password.' });
        const user = userEvent.setup();
        render(<LoginForm />);

        await user.type(screen.getByLabelText(/email/i), 'admin@progreenbuild.test');
        await user.type(screen.getByLabelText(/password/i), 'wrong');
        await user.click(screen.getByRole('button', { name: 'Sign in' }));

        expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    });

    it('disables the button while the action is pending', async () => {
        let resolveLogin;
        login.mockImplementation(() => new Promise((resolve) => { resolveLogin = resolve; }));
        const user = userEvent.setup();
        render(<LoginForm />);

        await user.type(screen.getByLabelText(/email/i), 'admin@progreenbuild.test');
        await user.type(screen.getByLabelText(/password/i), 'secret');
        await user.click(screen.getByRole('button', { name: 'Sign in' }));

        const pendingButton = await screen.findByRole('button', { name: 'Signing in...' });
        expect(pendingButton).toBeDisabled();

        resolveLogin({ error: null });
        await waitFor(() => expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled());
    });
});
