import { relations } from 'drizzle-orm'
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'
import { users } from '#/auth/auth.schema'

export const videos = pgTable(
	'videos',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		description: text('description'),
		url: text('url').notNull(),
		thumbnailUrl: text('thumbnail_url'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		creatorId: text('creator_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
	},
	(table) => [
		index('videos_creator_id_idx').on(table.creatorId),
		// Keyset pagination orders by (created_at DESC, id DESC).
		index('videos_created_at_id_idx').on(table.createdAt, table.id),
	],
)

// One row per (user, video). Composite PK guarantees a user can only like a
// video once (step 8: dedupe likes). Likes are counted from this table, never
// stored as a column on `videos`.
export const videoLikes = pgTable(
	'video_likes',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		videoId: uuid('video_id')
			.notNull()
			.references(() => videos.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.videoId] }),
		index('video_likes_video_id_idx').on(table.videoId),
	],
)

export const videosRelations = relations(videos, ({ one, many }) => ({
	creator: one(users, {
		fields: [videos.creatorId],
		references: [users.id],
	}),
	likes: many(videoLikes),
}))

export const videoLikesRelations = relations(videoLikes, ({ one }) => ({
	video: one(videos, {
		fields: [videoLikes.videoId],
		references: [videos.id],
	}),
	user: one(users, {
		fields: [videoLikes.userId],
		references: [users.id],
	}),
}))
