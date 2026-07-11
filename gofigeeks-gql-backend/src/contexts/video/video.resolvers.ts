import { and, desc, eq, sql } from 'drizzle-orm'
import { GraphQLError } from 'graphql'
import { users } from '#/auth/auth.schema'
import type { GraphQLContext } from '#/shared/context'
import { drizzleClient } from '#/shared/drizzle-client'
import { pubSub, type VideoRow } from '#/shared/pubsub'
import { uploadFile } from '#/shared/storage'
import { videoLikes, videos } from './video.schema'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

// Cursor = base64("<createdAt ISO>|<id>"). Keyset pagination orders by
// (createdAt DESC, id DESC), so a cursor points just past the last edge.
function encodeCursor(row: VideoRow): string {
	return Buffer.from(`${row.createdAt.toISOString()}|${row.id}`).toString(
		'base64',
	)
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } {
	const [iso, id] = Buffer.from(cursor, 'base64').toString('utf8').split('|')
	const createdAt = new Date(iso)
	if (Number.isNaN(createdAt.getTime()) || !id) {
		throw new GraphQLError('Invalid cursor', {
			extensions: { code: 'BAD_USER_INPUT' },
		})
	}
	return { createdAt, id }
}

async function getVideoOrThrow(id: string): Promise<VideoRow> {
	const [row] = await drizzleClient
		.select()
		.from(videos)
		.where(eq(videos.id, id))
		.limit(1)
	if (!row) {
		throw new GraphQLError('Video not found', {
			extensions: { code: 'NOT_FOUND' },
		})
	}
	return row
}

export const videoResolvers = {
	Query: {
		videos: async (
			_: unknown,
			args: {
				first?: number
				after?: string
				filters?: { userId?: string | null }
			},
		) => {
			const limit = Math.min(
				Math.max(args.first ?? DEFAULT_PAGE_SIZE, 1),
				MAX_PAGE_SIZE,
			)

			const conditions = []
			if (args.filters?.userId) {
				conditions.push(eq(videos.creatorId, args.filters.userId))
			}
			if (args.after) {
				const { createdAt, id } = decodeCursor(args.after)
				// Row-value comparison: (created_at, id) < (cursor.created_at, id).
				conditions.push(
					sql`(${videos.createdAt}, ${videos.id}) < (${createdAt.toISOString()}, ${id})`,
				)
			}

			// Fetch one extra row to determine hasNextPage without a count query.
			const rows = await drizzleClient
				.select()
				.from(videos)
				.where(conditions.length ? and(...conditions) : undefined)
				.orderBy(desc(videos.createdAt), desc(videos.id))
				.limit(limit + 1)

			const hasNextPage = rows.length > limit
			const page = hasNextPage ? rows.slice(0, limit) : rows

			return {
				edges: page.map((node) => ({ cursor: encodeCursor(node), node })),
				pageInfo: {
					endCursor: page.length ? encodeCursor(page[page.length - 1]) : null,
					hasNextPage,
				},
			}
		},

		video: (_: unknown, { id }: { id: string }) => getVideoOrThrow(id),

		user: async (_: unknown, { id }: { id: string }) => {
			const [row] = await drizzleClient
				.select()
				.from(users)
				.where(eq(users.id, id))
				.limit(1)
			if (!row) {
				throw new GraphQLError('User not found', {
					extensions: { code: 'NOT_FOUND' },
				})
			}
			return row
		},
	},

	Mutation: {
		upload: async (_: unknown, { file }: { file: File }) => {
			return uploadFile(file)
		},

		publishVideo: async (
			_: unknown,
			{
				url,
				description,
				thumbnailUrl,
			}: { url: string; description?: string | null; thumbnailUrl?: string | null },
			ctx: GraphQLContext,
		) => {
			const [row] = await drizzleClient
				.insert(videos)
				.values({
					url,
					description: description ?? null,
					thumbnailUrl: thumbnailUrl ?? null,
					creatorId: ctx.user!.id,
				})
				.returning()

			pubSub.publish('videoPublished', row)
			return row
		},

		likeVideo: async (
			_: unknown,
			{ videoId }: { videoId: string },
			ctx: GraphQLContext,
		) => {
			await drizzleClient
				.insert(videoLikes)
				.values({ userId: ctx.user!.id, videoId })
				.onConflictDoNothing()
			return getVideoOrThrow(videoId)
		},

		unlikeVideo: async (
			_: unknown,
			{ videoId }: { videoId: string },
			ctx: GraphQLContext,
		) => {
			await drizzleClient
				.delete(videoLikes)
				.where(
					and(
						eq(videoLikes.userId, ctx.user!.id),
						eq(videoLikes.videoId, videoId),
					),
				)
			return getVideoOrThrow(videoId)
		},
	},

	Subscription: {
		videos: {
			// @auth (on the subscription field) guards this at subscribe time.
			subscribe: () => pubSub.subscribe('videoPublished'),
			resolve: (payload: VideoRow) => payload,
		},
	},

	Video: {
		// Batched per-request via the user-scoped loader (see src/app/index.ts).
		likedByMe: (video: VideoRow, _: unknown, ctx: GraphQLContext) =>
			ctx.likedByMeLoader.load(video.id),
	},
}
