import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { USER, VIDEOS } from '../graphql/operations'
import type { User, VideoConnection } from '../types'

export function ProfilePage() {
	const { id = '' } = useParams()

	const { data: userData, loading: userLoading } = useQuery<{ user: User }>(
		USER,
		{ variables: { id } },
	)
	// Reuse the same videos query, scoped to this creator (step 7 / step 12).
	const { data: videosData, loading: videosLoading } = useQuery<{
		videos: VideoConnection
	}>(VIDEOS, { variables: { first: 60, filters: { userId: id } } })

	const user = userData?.user
	const videos = videosData?.videos.edges.map((e) => e.node) ?? []

	if (userLoading) {
		return (
			<div className="flex h-full items-center justify-center text-neutral-500">
				Loading…
			</div>
		)
	}

	if (!user) {
		return (
			<div className="flex h-full items-center justify-center text-neutral-500">
				User not found.
			</div>
		)
	}

	return (
		<div className="h-full overflow-y-auto p-6">
			<header className="mb-8 flex items-center gap-4">
				{user.image ? (
					<img
						src={user.image}
						alt=""
						className="h-20 w-20 rounded-full object-cover"
					/>
				) : (
					<span className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-600 text-3xl font-bold">
						{user.name.charAt(0)}
					</span>
				)}
				<div>
					<h1 className="text-2xl font-bold">@{user.name}</h1>
					{user.biography && (
						<p className="mt-1 max-w-xl whitespace-pre-line text-sm text-neutral-400">
							{user.biography}
						</p>
					)}
				</div>
			</header>

			{videosLoading ? (
				<div className="grid grid-cols-3 gap-2">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="aspect-[9/16] animate-pulse rounded-lg bg-neutral-900"
						/>
					))}
				</div>
			) : videos.length === 0 ? (
				<p className="text-neutral-500">No videos yet.</p>
			) : (
				<div className="grid grid-cols-3 gap-2">
					{videos.map((video) => (
						<div
							key={video.id}
							className="relative aspect-[9/16] overflow-hidden rounded-lg bg-neutral-900"
						>
							{video.thumbnailUrl ? (
								<img
									src={video.thumbnailUrl}
									alt=""
									className="h-full w-full object-cover"
								/>
							) : (
								<video
									src={video.url}
									className="h-full w-full object-cover"
									muted
								/>
							)}
							<span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs">
								❤️ {video.likes}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
