import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth()

	// Wait for the session query before deciding, so a refresh on a protected
	// route doesn't flash the login page.
	if (loading) {
		return (
			<div className="flex h-full items-center justify-center text-neutral-500">
				Loading…
			</div>
		)
	}

	if (!user) return <Navigate to="/login" replace />

	return <>{children}</>
}
