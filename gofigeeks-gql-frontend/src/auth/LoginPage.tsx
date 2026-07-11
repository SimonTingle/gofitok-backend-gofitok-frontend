import { type FormEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function LoginPage() {
	const { user, loading, signIn } = useAuth()
	const navigate = useNavigate()
	const [email, setEmail] = useState('admin@example.com')
	const [password, setPassword] = useState('admin')
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	// Already authenticated → bounce to the feed.
	if (!loading && user) return <Navigate to="/" replace />

	async function onSubmit(e: FormEvent) {
		e.preventDefault()
		setError(null)
		setSubmitting(true)
		try {
			await signIn(email, password)
			navigate('/', { replace: true })
		} catch (err) {
			setError(
				err instanceof Error && /invalid/i.test(err.message)
					? 'Invalid credentials'
					: 'Something went wrong. Try again.',
			)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="flex h-full items-center justify-center bg-black px-4">
			<form
				onSubmit={onSubmit}
				className="w-full max-w-sm rounded-2xl bg-neutral-900 p-8 shadow-xl"
			>
				<h1 className="mb-1 text-2xl font-bold">GofiTok</h1>
				<p className="mb-6 text-sm text-neutral-400">Sign in to continue</p>

				<label className="mb-3 block">
					<span className="mb-1 block text-xs text-neutral-400">Email</span>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
					/>
				</label>

				<label className="mb-4 block">
					<span className="mb-1 block text-xs text-neutral-400">Password</span>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
					/>
				</label>

				{error && <p className="mb-3 text-sm text-red-400">{error}</p>}

				<button
					type="submit"
					disabled={submitting}
					className="w-full rounded-lg bg-pink-600 py-2 font-semibold transition hover:bg-pink-500 disabled:opacity-50"
				>
					{submitting ? 'Signing in…' : 'Sign in'}
				</button>

				<p className="mt-4 text-center text-xs text-neutral-500">
					Demo: admin@example.com / admin · user@example.com / user
				</p>
			</form>
		</div>
	)
}
