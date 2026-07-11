export interface User {
	id: string
	name: string
	email: string
	image: string | null
	biography: string | null
}

export interface Video {
	id: string
	description: string | null
	url: string
	thumbnailUrl: string | null
	likes: number
	likedByMe: boolean
	createdAt: string
	creator: Pick<User, 'id' | 'name' | 'image'>
}

export interface PageInfo {
	endCursor: string | null
	hasNextPage: boolean
}

export interface VideoConnection {
	edges: { cursor: string; node: Video }[]
	pageInfo: PageInfo
}
