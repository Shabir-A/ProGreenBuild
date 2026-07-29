'use client';

import { useActionState } from 'react';
import { login } from './actions';

const initialState = { error: null };

export default function LoginForm() {
    const [state, formAction, pending] = useActionState(login, initialState);

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-4 font-sans text-black">
            <form action={formAction} className="w-full max-w-xs border border-gray-300 p-6">
                <h1 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Admin login</h1>

                <label className="mt-4 block text-sm">
                    Email
                    <input
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        className="mt-1 block w-full border border-gray-300 px-2 py-1 text-sm"
                    />
                </label>

                <label className="mt-3 block text-sm">
                    Password
                    <input
                        type="password"
                        name="password"
                        required
                        autoComplete="current-password"
                        className="mt-1 block w-full border border-gray-300 px-2 py-1 text-sm"
                    />
                </label>

                {state?.error && <p className="mt-3 text-sm text-red-700">{state.error}</p>}
                }

                <button
                    type="submit"
                    disabled={pending}
                    className="bg-gray-200 border border-gray-400 px-3 py-2 text-sm font-mono hover:bg-gray-300 cursor-pointer rounded mt-4 w-full"
                >
                    {pending ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </div>
    );
}
