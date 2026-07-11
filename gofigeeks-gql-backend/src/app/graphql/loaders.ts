import { inArray, sql } from 'drizzle-orm'
import { users } from '#/auth/auth.schema'
import { drizzleClient } from '#/shared/drizzle-client'
import type { VideoRow } from '#/shared/pubsub'
import { videoLikes } from '#/video/video.schema'

type Entry = { obj: VideoRow }

/**
 * Field loaders for the `Video` type. Each function receives all field requests
 * batched for the current request and must return results in the same order.
 * DataLoaders.appendResolvers wires these as field resolvers (see
 * src/app/graphql/shared/data-loaders.ts).
 */
export const loaders = {
	Video: {
		// Step 3: batch-load creators so N videos = 1 query, and only when asked.
		creator: async (entries: Entry[]) => {
			const ids = [...new Set(entries.map((e) => e.obj.creatorId))]
			const rows = ids.length
				? await drizzleClient.select().from(users).where(inArray(users.id, ids))
				: []
			const byId = new Map(rows.map((u) => [u.id, u]))
			return entries.map((e) => byId.get(e.obj.creatorId) ?? null)
		},

		// Step 10: count likes for all requested videos in a single grouped query.
		likes: async (entries: Entry[]) => {
			const ids = [...new Set(entries.map((e) => e.obj.id))]
			const rows = ids.length
				? await drizzleClient
						.select({
							videoId: videoLikes.videoId,
							count: sql<number>`count(*)::int`,
						})
						.from(videoLikes)
						.where(inArray(videoLikes.videoId, ids))
						.groupBy(videoLikes.videoId)
				: []
			const byId = new Map(rows.map((r) => [r.videoId, r.count]))
			return entries.map((e) => byId.get(e.obj.id) ?? 0)
		},
	},
}
