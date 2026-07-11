import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function Sidebar({ onUploadClick }: { onUploadClick: () => void }) {
	const { user, signOut } = useAuth()
	const navigate = useNavigate()

	async function handleSignOut() {
		await signOut()
		navigate('/login', { replace: true })
	}

	const linkClass = ({ isActive }: { isActive: boolean }) =>
		`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
			isActive ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
		}`

	return (
		<aside className="flex w-56 shrink-0 flex-col justify-between border-r border-neutral-800 bg-black p-4">
			<div>
				<h1 className="mb-6 px-2 text-2xl font-extrabold text-pink-500">
					GofiTok
				</h1>
				<nav className="space-y-1">
					<NavLink to="/" end className={linkClass}>
						<span>🏠</span> Home
					</NavLink>
					{user && (
						<NavLink to={`/profile/${user.id}`} className={linkClass}>
							<span>👤</span> Your profile
						</NavLink>
					)}
				</nav>

				<button
					onClick={onUploadClick}
					className="mt-6 w-full rounded-lg bg-pink-600 py-2 text-sm font-semibold transition hover:bg-pink-500"
				>
					+ Upload
				</button>
			</div>

			<div className="border-t border-neutral-800 pt-4">
				{user && (
					<p className="mb-2 truncate px-2 text-sm text-neutral-300">
						{user.name}
					</p>
				)}
				<button
					onClick={handleSignOut}
					className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-400 transition hover:text-white"
				>
					Sign out
				</button>
			</div>
		</aside>
	)
}
