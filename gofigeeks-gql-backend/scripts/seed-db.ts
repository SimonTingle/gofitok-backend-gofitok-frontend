import '@/env'

import { auth } from '#/shared/auth'
import { drizzleClient } from '#/shared/drizzle-client'
import { videoLikes, videos } from '#/video/video.schema'
import { seed, reset } from 'drizzle-seed'
import * as authSchema from '../src/contexts/auth/auth.schema'
import * as videoSchema from '../src/contexts/video/video.schema'
import { users as seedUsers } from './seed/users'
import { users as usersTable } from '../src/contexts/auth/auth.schema'

// Sample public URLs so the generated feed shows real playable media.
const SAMPLE_VIDEO_URLS = [
	'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
	'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
	'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
	'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
	'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
]

// Portrait placeholder thumbnails (picsum) so the profile grid has posters.
const SAMPLE_THUMBNAILS = Array.from(
	{ length: 12 },
	(_, i) => `https://picsum.photos/seed/tiktok${i + 1}/400/700`,
)

console.log('Resetting database...')
// reset every table (auth + video) so seeding is reproducible.
await reset(drizzleClient, { ...authSchema, ...videoSchema })

console.log('Seeding initial users (better-auth, so credentials work)...')
// Created via better-auth so the known accounts can actually sign in.
await Promise.all(
	seedUsers.map((user) =>
		auth.api.createUser({
			body: {
				email: user.email,
				password: user.password,
				name: user.name,
				role: user.role as any,
				data: { biography: user.biography },
			},
		}),
	),
)

const userIds = (
	await drizzleClient.select({ id: usersTable.id }).from(usersTable)
).map((u) => u.id)

console.log('Seeding videos with drizzle-seed (deterministic)...')
await seed(drizzleClient, { videos }, { seed: 42 }).refine((f) => ({
	videos: {
		count: 40,
		columns: {
			description: f.loremIpsum({ sentencesCount: 1 }),
			url: f.valuesFromArray({ values: SAMPLE_VIDEO_URLS }),
			thumbnailUrl: f.valuesFromArray({ values: SAMPLE_THUMBNAILS }),
			creatorId: f.valuesFromArray({ values: userIds }),
		},
	},
}))

console.log('Seeding likes (unique user/video pairs)...')
const videoIds = (
	await drizzleClient.select({ id: videos.id }).from(videos)
).map((v) => v.id)

// Random unique (userId, videoId) pairs — composite PK forbids duplicates.
const likePairs = new Set<string>()
for (const videoId of videoIds) {
	const likeCount = Math.floor(Math.random() * userIds.length)
	for (let i = 0; i < likeCount; i++) {
		const userId = userIds[Math.floor(Math.random() * userIds.length)]
		likePairs.add(`${userId}::${videoId}`)
	}
}
if (likePairs.size) {
	await drizzleClient
		.insert(videoLikes)
		.values(
			[...likePairs].map((pair) => {
				const [userId, videoId] = pair.split('::')
				return { userId, videoId }
			}),
		)
		.onConflictDoNothing()
}

console.log(
	`Seed completed: ${seedUsers.length} users, ${videoIds.length} videos, ${likePairs.size} likes.`,
)
process.exit(0)
