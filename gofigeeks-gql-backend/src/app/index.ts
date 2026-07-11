import './env'

import { renderApolloSandbox } from '@graphql-yoga/render-apollo-sandbox'
import DataLoader from 'dataloader'
import { and, eq, inArray } from 'drizzle-orm'
import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import { auth } from '#/shared/auth'
import { drizzleClient } from '#/shared/drizzle-client'
import { videoLikes } from '#/video/video.schema'
import { schema } from './graphql/schema'
import { DataLoaders } from './graphql/shared/data-loaders'

/**
 * Builds a per-request loader for `Video.likedByMe`, batched by video id.
 * Closes over the current user so the generic (context-less) loaders don't have
 * to. Unauthenticated → always false.
 */
function createLikedByMeLoader(userId: string | undefined) {
	return new DataLoader<string, boolean>(async (videoIds) => {
		if (!userId) return videoIds.map(() => false)
		const rows = await drizzleClient
			.select({ videoId: videoLikes.videoId })
			.from(videoLikes)
			.where(
				and(
					eq(videoLikes.userId, userId),
					inArray(videoLikes.videoId, [...videoIds]),
				),
			)
		const liked = new Set(rows.map((r) => r.videoId))
		return videoIds.map((id) => liked.has(id))
	})
}

const trustedOrigins =
	process.env.TRUSTED_ORIGINS?.split(',')
		.map((o) => o.trim())
		.filter(Boolean) ?? []

export const yoga = createYoga({
	schema,
	// Keep error masking in real runtimes; disable under test so intentional
	// GraphQLErrors (auth codes) are asserted directly.
	maskedErrors: process.env.NODE_ENV === 'test' ? false : undefined,
	async context(serverContext) {
		const loaders = DataLoaders.createContext()

		// Resolve the session (and thus the user) exactly once per request from
		// the cookie. Resolvers and the @auth directive read ctx.user instead of
		// re-parsing the cookie (guide step 7).
		const session = await auth.api.getSession({
			headers: serverContext.request.headers,
		})

		// Mutable headers the auth mutations push Set-Cookie onto; merged onto the
		// real response by the onResponse plugin below. Stash on serverContext so
		// the plugin (which only receives serverContext) can read it back.
		const resHeaders = new Headers()
		;(serverContext as any).resHeaders = resHeaders

		return {
			...loaders,
			request: serverContext.request,
			headers: serverContext.request.headers,
			resHeaders,
			user: session?.user ?? null,
			session: session ?? null,
			likedByMeLoader: createLikedByMeLoader(session?.user?.id),
		}
	},
	plugins: [
		{
			onResponse({ response, serverContext }) {
				const extra = (serverContext as any)?.resHeaders as
					| Headers
					| undefined
				if (!extra) return
				for (const cookie of extra.getSetCookie()) {
					response.headers.append('set-cookie', cookie)
				}
			},
		},
	],
	cors: {
		origin: trustedOrigins.length ? trustedOrigins : '*',
		credentials: true,
	},
	renderGraphiQL: renderApolloSandbox({
		initialState: {
			includeCookies: true,
		},
	}),
})

const server = createServer(yoga)

if (process.env.NODE_ENV !== 'test') {
	server.listen(4000, () => {
		console.info('Server is running on http://localhost:4000/graphql')
	})
}
