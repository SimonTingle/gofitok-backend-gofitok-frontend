import { APIError } from 'better-auth/api'
import { GraphQLError } from 'graphql'
import { auth } from '#/shared/auth'
import type { GraphQLContext } from '#/shared/context'

/**
 * Copies the `Set-Cookie` headers better-auth produced onto the response
 * headers we merge in the Yoga `onResponse` plugin (see src/app/index.ts).
 */
function forwardCookies(from: Headers, to: Headers) {
	for (const cookie of from.getSetCookie()) {
		to.append('set-cookie', cookie)
	}
}

export const authResolvers = {
	Query: {
		session: (_: unknown, __: unknown, ctx: GraphQLContext) => {
			return ctx.session ? { user: ctx.session.user } : null
		},
	},
	Mutation: {
		signIn: async (
			_: unknown,
			{ email, password }: { email: string; password: string },
			ctx: GraphQLContext,
		) => {
			try {
				const { headers, response } = await auth.api.signInEmail({
					body: { email, password },
					returnHeaders: true,
				})

				forwardCookies(headers, ctx.resHeaders)

				return { user: response.user }
			} catch (error) {
				if (error instanceof APIError) {
					throw new GraphQLError('Invalid credentials', {
						extensions: { code: 'UNAUTHENTICATED' },
					})
				}
				throw error
			}
		},
		signOut: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
			const { headers } = await auth.api.signOut({
				headers: ctx.headers,
				returnHeaders: true,
			})

			forwardCookies(headers, ctx.resHeaders)

			return true
		},
	},
}
