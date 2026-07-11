import { useApolloClient } from '@apollo/client'
import { useEffect } from 'react'
import { VIDEO } from '../graphql/operations'
import type { Video } from '../types'

/**
 * Step 9: every 3 seconds, refetch the likes of ONLY the video currently on
 * screen (via the single `video(id)` query) and hand the fresh counts back.
 * Polls nothing when no video is active.
 */
export function useLiveLikes(
	activeVideoId: string | null,
	onUpdate: (video: Pick<Video, 'id' | 'likes' | 'likedByMe'>) => void,
) {
	const client = useApolloClient()

	useEffect(() => {
		if (!activeVideoId) return
		let cancelled = false

		const tick = async () => {
			try {
				const { data } = await client.query<{ video: Video }>({
					query: VIDEO,
					variables: { id: activeVideoId },
					fetchPolicy: 'no-cache',
				})
				if (!cancelled && data?.video) {
					onUpdate({
						id: data.video.id,
						likes: data.video.likes,
						likedByMe: data.video.likedByMe,
					})
				}
			} catch {
				// transient — try again next tick
			}
		}

		const interval = setInterval(tick, 3000)
		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [activeVideoId, client, onUpdate])
}
