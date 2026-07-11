import { gql } from '@apollo/client'

// Reusable video field selection (only what the UI renders).
const VIDEO_FIELDS = gql`
	fragment VideoFields on Video {
		id
		description
		url
		thumbnailUrl
		likes
		likedByMe
		createdAt
		creator {
			id
			name
			image
		}
	}
`

export const SESSION = gql`
	query Session {
		session {
			user {
				id
				name
				email
				image
				biography
			}
		}
	}
`

export const SIGN_IN = gql`
	mutation SignIn($email: String!, $password: String!) {
		signIn(email: $email, password: $password) {
			user {
				id
				name
				email
				image
				biography
			}
		}
	}
`

export const SIGN_OUT = gql`
	mutation SignOut {
		signOut
	}
`

export const VIDEOS = gql`
	${VIDEO_FIELDS}
	query Videos($first: Int, $after: String, $filters: VideoFilters) {
		videos(first: $first, after: $after, filters: $filters) {
			edges {
				cursor
				node {
					...VideoFields
				}
			}
			pageInfo {
				endCursor
				hasNextPage
			}
		}
	}
`

export const VIDEO = gql`
	${VIDEO_FIELDS}
	query Video($id: ID!) {
		video(id: $id) {
			...VideoFields
		}
	}
`

export const USER = gql`
	query User($id: ID!) {
		user(id: $id) {
			id
			name
			image
			biography
		}
	}
`

export const UPLOAD = gql`
	mutation Upload($file: File!) {
		upload(file: $file)
	}
`

export const PUBLISH_VIDEO = gql`
	${VIDEO_FIELDS}
	mutation PublishVideo(
		$url: String!
		$description: String
		$thumbnailUrl: String
	) {
		publishVideo(
			url: $url
			description: $description
			thumbnailUrl: $thumbnailUrl
		) {
			...VideoFields
		}
	}
`

export const LIKE_VIDEO = gql`
	mutation LikeVideo($videoId: ID!) {
		likeVideo(videoId: $videoId) {
			id
			likes
			likedByMe
		}
	}
`

export const UNLIKE_VIDEO = gql`
	mutation UnlikeVideo($videoId: ID!) {
		unlikeVideo(videoId: $videoId) {
			id
			likes
			likedByMe
		}
	}
`

export const VIDEOS_SUBSCRIPTION = gql`
	${VIDEO_FIELDS}
	subscription OnNewVideo {
		videos {
			...VideoFields
		}
	}
`
