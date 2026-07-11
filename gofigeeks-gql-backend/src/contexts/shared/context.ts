import type { AuthSession, AuthUser } from './auth'

/**
 * GraphQL context, built once per request in `src/app/index.ts`.
 * The session/cookie is resolved a single time here and exposed as `user`, so
 * resolvers and the `@auth` directive never re-parse the cookie (guide step 7).
 */
export interface GraphQLContext {
	request: Request
	/** Incoming request headers (carries the auth cookie). */
	headers: Headers
	/** Mutable headers merged onto the HTTP response (used to set auth cookies). */
	resHeaders: Headers
	/** Authenticated user, or null when there is no valid session. */
	user: AuthUser | null
	/** Full better-auth session (user + session), or null. */
	session: AuthSession
	/** DataLoader instances, injected by DataLoaders.createContext(). */
	loaders: Record<string, Record<string, { load: (key: unknown) => unknown }>>
	/**
	 * Request-scoped loader answering "did the current user like this video?",
	 * batched by video id. Returns false for everything when unauthenticated.
	 * User-dependent, so it lives here rather than in the generic loaders.
	 */
	likedByMeLoader: { load: (videoId: string) => Promise<boolean> }
}
