import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { LIKE_VIDEO, UNLIKE_VIDEO } from '../graphql/operations'

interface Props {
	videoId: string
	likes: number
	likedByMe: boolean
	/** Lets the parent (feed) keep its copy in sync after a toggle. */
	onChange?: (likes: number, likedByMe: boolean) => void
}

export function LikeButton({ videoId, likes, likedByMe, onChange }: Props) {
	const [like] = useMutation(LIKE_VIDEO)
	const [unlike] = useMutation(UNLIKE_VIDEO)
	const [busy, setBusy] = useState(false)

	async function toggle() {
		if (busy) return
		setBusy(true)
		// Optimistic update.
		const next = !likedByMe
		onChange?.(likes + (next ? 1 : -1), next)
		try {
			const res = next
				? await like({ variables: { videoId } })
				: await unlike({ variables: { videoId } })
			const data = next ? res.data?.likeVideo : res.data?.unlikeVideo
			if (data) onChange?.(data.likes, data.likedByMe)
		} catch {
			// Roll back on failure.
			onChange?.(likes, likedByMe)
		} finally {
			setBusy(false)
		}
	}

	return (
		<button
			onClick={toggle}
			className="flex flex-col items-center gap-1"
			aria-pressed={likedByMe}
		>
			<span
				className={`flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/70 text-2xl transition ${
					likedByMe ? 'text-pink-500' : 'text-white'
				}`}
			>
				{likedByMe ? '❤️' : '🤍'}
			</span>
			<span className="text-xs font-semibold">{likes}</span>
		</button>
	)
}
