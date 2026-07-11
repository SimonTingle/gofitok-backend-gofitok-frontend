import type { InferSelectModel } from 'drizzle-orm'
import { createPubSub } from 'graphql-yoga'
import type { videos } from '#/video/video.schema'

export type VideoRow = InferSelectModel<typeof videos>

// Module-level singleton so the publishing mutation and the subscription share
// the same event bus across every request/connection.
export const pubSub = createPubSub<{
	videoPublished: [payload: VideoRow]
}>()
