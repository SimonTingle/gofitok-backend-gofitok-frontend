import { useMutation, useQuery } from '@apollo/client'
import {
	createContext,
	useCallback,
	useContext,
	type ReactNode,
} from 'react'
import { SESSION, SIGN_IN, SIGN_OUT } from '../graphql/operations'
import type { User } from '../types'

interface AuthContextValue {
	user: User | null
	loading: boolean
	signIn: (email: string, password: string) => Promise<void>
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
	// The httpOnly session cookie is the source of truth; ask the server who we
	// are on load. Survives page refreshes without any localStorage.
	const { data, loading, refetch } = useQuery(SESSION)
	const [signInMutation] = useMutation(SIGN_IN)
	const [signOutMutation] = useMutation(SIGN_OUT)

	const user: User | null = data?.session?.user ?? null

	const signIn = useCallback(
		async (email: string, password: string) => {
			await signInMutation({ variables: { email, password } })
			// Re-read the session now that the auth cookie is set.
			await refetch()
		},
		[signInMutation, refetch],
	)

	const signOut = useCallback(async () => {
		await signOutMutation()
		await refetch()
	}, [signOutMutation, refetch])

	return (
		<AuthContext.Provider value={{ user, loading, signIn, signOut }}>
			{children}
		</AuthContext.Provider>
	)
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}
