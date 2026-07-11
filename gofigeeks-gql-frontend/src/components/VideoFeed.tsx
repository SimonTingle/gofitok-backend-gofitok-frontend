import { useApolloClient } from '@apollo/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { VIDEOS } from '../graphql/operations'
import type { Video, VideoConnection } from '../types'
import { NewVideosBanner } from './NewVideosBanner'
import { useLiveLikes } from '../hooks/useLiveLikes'
import { VideoCard } from './VideoCard'
import { VideoSkeleton } from './VideoSkeleton'

const PAGE_SIZE = 5

export function VideoFeed() {
	const client = useApolloClient()
	const [videos, setVideos] = useState<Video[]>([])
	const [loading, setLoading] = useState(false)
	const [initialised, setInitialised] = useState(false)
	const [activeId, setActiveId] = useState<string | null>(null)

	// Refs mirror pagination state so the IntersectionObserver stays stable.
	const cursorRef = useRef<string | null>(null)
	const hasNextRef = useRef(true)
	const loadingRef = useRef(false)
	const scrollRef = useRef<HTMLDivElement>(null)
	const sentinelRef = useRef<HTMLDivElement>(null)

	const patchVideo = useCallback((id: string, patch: Partial<Video>) => {
		setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)))
	}, [])

	const loadMore = useCallback(async () => {
		if (loadingRef.current || !hasNextRef.current) return
		loadingRef.current = true
		setLoading(true)
		try {
			const { data } = await client.query<{ videos: VideoConnection }>({
				query: VIDEOS,
				variables: { first: PAGE_SIZE, after: cursorRef.current },
			})
			const conn = data.videos
			setVideos((prev) => {
				const seen = new Set(prev.map((v) => v.id))
				const fresh = conn.edges
					.map((e) => e.node)
					.filter((n) => !seen.has(n.id))
				return [...prev, ...fresh]
			})
			cursorRef.current = conn.pageInfo.endCursor
			hasNextRef.current = conn.pageInfo.hasNextPage
		} finally {
			loadingRef.current = false
			setLoading(false)
			setInitialised(true)
		}
	}, [client])

	// Initial page.
	useEffect(() => {
		void loadMore()
	}, [loadMore])

	// Infinite scroll: load the next page when the sentinel scrolls into view.
	useEffect(() => {
		const sentinel = sentinelRef.current
		const root = scrollRef.current
		if (!sentinel || !root) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) void loadMore()
			},
			{ root, rootMargin: '400px' },
		)
		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [loadMore])

	// Prepend brand-new videos (from the subscription banner), newest first.
	const prependVideos = useCallback((incoming: Video[]) => {
		setVideos((prev) => {
			const seen = new Set(prev.map((v) => v.id))
			const fresh = incoming.filter((v) => !seen.has(v.id))
			return [...fresh, ...prev]
		})
		// Defer past the commit so we scroll to the newly-prepended card, not the
		// old top one.
		requestAnimationFrame(() =>
			requestAnimationFrame(() =>
				scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }),
			),
		)
	}, [])

	// Step 9: poll only the on-screen video's likes every 3s.
	useLiveLikes(activeId, (updated) =>
		patchVideo(updated.id, {
			likes: updated.likes,
			likedByMe: updated.likedByMe,
		}),
	)

	return (
		<div className="relative h-full">
			<NewVideosBanner onShow={prependVideos} />

			<div
				ref={scrollRef}
				className="no-scrollbar h-full snap-y snap-mandatory overflow-y-scroll"
			>
				{videos.map((video) => (
					<VideoCard
						key={video.id}
						video={video}
						onLikeChange={(id, likes, likedByMe) =>
							patchVideo(id, { likes, likedByMe })
						}
						onVisible={setActiveId}
					/>
				))}

				{loading && <VideoSkeleton />}

				{initialised && videos.length === 0 && !loading && (
					<div className="flex h-full items-center justify-center text-neutral-500">
						No videos yet — upload the first one!
					</div>
				)}

				{/* Infinite-scroll trigger */}
				<div ref={sentinelRef} className="h-px w-full" />
			</div>
		</div>
	)
}
