import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { parse } from 'graphql'
import { beforeAll, describe, expect, it } from 'vitest'
import { yoga } from '@/index'

const ENDPOINT = 'http://yoga/graphql'

async function gql(
	query: string,
	opts: { variables?: Record<string, unknown>; cookie?: string } = {},
) {
	const res = await yoga.fetch(ENDPOINT, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			...(opts.cookie ? { cookie: opts.cookie } : {}),
		},
		body: JSON.stringify({ query, variables: opts.variables }),
	})
	const setCookie = res.headers.getSetCookie?.() ?? []
	return { body: (await res.json()) as any, setCookie }
}

async function signInCookie(email: string, password: string) {
	const { setCookie } = await gql(
		`mutation($e:String!,$p:String!){ signIn(email:$e,password:$p){ user{ id } } }`,
		{ variables: { e: email, p: password } },
	)
	// Turn Set-Cookie headers into a Cookie request header (name=value only).
	return setCookie.map((c) => c.split(';')[0]).join('; ')
}

let cookie: string

beforeAll(async () => {
	cookie = await signInCookie('admin@example.com', 'admin')
	expect(cookie).toContain('better-auth')
})

describe('auth', () => {
	it('rejects videos query without a session', async () => {
		const { body } = await gql(`{ videos { edges { node { id } } } }`)
		expect(body.data).toBeNull()
		expect(body.errors[0].extensions.code).toBe('UNAUTHENTICATED')
	})

	it('rejects invalid credentials', async () => {
		const { body } = await gql(
			`mutation{ signIn(email:"admin@example.com",password:"wrong"){ user{ id } } }`,
		)
		expect(body.errors[0].message).toBe('Invalid credentials')
	})

	it('accepts the videos query with a session cookie', async () => {
		const { body } = await gql(
			`{ videos(first:2){ edges{ node{ id likes creator{ name } } } pageInfo{ hasNextPage } } }`,
			{ cookie },
		)
		expect(body.errors).toBeUndefined()
		expect(Array.isArray(body.data.videos.edges)).toBe(true)
		expect(body.data.videos.pageInfo).toHaveProperty('hasNextPage')
	})
})

describe('videos', () => {
	it('publishes a video that then appears in the feed', async () => {
		const url = `https://cdn.test/${Date.now()}.mp4`
		const { body: pub } = await gql(
			`mutation($u:String!){ publishVideo(url:$u,description:"vitest"){ id url description likes } }`,
			{ cookie, variables: { u: url } },
		)
		expect(pub.errors).toBeUndefined()
		expect(pub.data.publishVideo.url).toBe(url)
		expect(pub.data.publishVideo.likes).toBe(0)

		const { body: feed } = await gql(
			`{ videos(first:1){ edges{ node{ id url } } } }`,
			{ cookie },
		)
		expect(feed.data.videos.edges[0].node.url).toBe(url)
	})

	it('likes and unlikes a video idempotently and tracks likedByMe', async () => {
		const { body: pub } = await gql(
			`mutation{ publishVideo(url:"https://cdn.test/like.mp4"){ id likedByMe } }`,
			{ cookie },
		)
		const id = pub.data.publishVideo.id
		expect(pub.data.publishVideo.likedByMe).toBe(false)

		const like1 = await gql(
			`mutation($id:ID!){ likeVideo(videoId:$id){ likes likedByMe } }`,
			{ cookie, variables: { id } },
		)
		const like2 = await gql(
			`mutation($id:ID!){ likeVideo(videoId:$id){ likes } }`,
			{ cookie, variables: { id } },
		)
		expect(like1.body.data.likeVideo.likes).toBe(1)
		expect(like1.body.data.likeVideo.likedByMe).toBe(true)
		expect(like2.body.data.likeVideo.likes).toBe(1) // idempotent

		const unlike = await gql(
			`mutation($id:ID!){ unlikeVideo(videoId:$id){ likes likedByMe } }`,
			{ cookie, variables: { id } },
		)
		expect(unlike.body.data.unlikeVideo.likes).toBe(0)
		expect(unlike.body.data.unlikeVideo.likedByMe).toBe(false)
	})

	it('persists a thumbnail and fetches a single video by id', async () => {
		const thumb = `https://cdn.test/${Date.now()}-thumb.jpg`
		const { body: pub } = await gql(
			`mutation($t:String){ publishVideo(url:"https://cdn.test/thumb.mp4",thumbnailUrl:$t){ id thumbnailUrl } }`,
			{ cookie, variables: { t: thumb } },
		)
		const id = pub.data.publishVideo.id
		expect(pub.data.publishVideo.thumbnailUrl).toBe(thumb)

		const { body: single } = await gql(
			`query($id:ID!){ video(id:$id){ id thumbnailUrl } }`,
			{ cookie, variables: { id } },
		)
		expect(single.data.video.id).toBe(id)
		expect(single.data.video.thumbnailUrl).toBe(thumb)
	})

	it('paginates with a cursor', async () => {
		const { body: p1 } = await gql(
			`{ videos(first:1){ edges{ cursor node{ id } } pageInfo{ endCursor hasNextPage } } }`,
			{ cookie },
		)
		expect(p1.data.videos.pageInfo.hasNextPage).toBe(true)
		const after = p1.data.videos.pageInfo.endCursor

		const { body: p2 } = await gql(
			`query($a:String){ videos(first:1, after:$a){ edges{ node{ id } } } }`,
			{ cookie, variables: { a: after } },
		)
		const firstId = p1.data.videos.edges[0].node.id
		const secondId = p2.data.videos.edges[0].node.id
		expect(secondId).not.toBe(firstId)
	})
})

describe('subscriptions', () => {
	it('returns an AsyncIterable when subscribing', async () => {
		const executor = buildHTTPExecutor({
			fetch: yoga.fetch,
			endpoint: ENDPOINT,
			headers: () => ({ cookie }),
		})
		const result = await executor({
			document: parse(/* GraphQL */ `
				subscription {
					videos {
						id
					}
				}
			`),
		})
		expect(Symbol.asyncIterator in result).toBe(true)
	})
})
