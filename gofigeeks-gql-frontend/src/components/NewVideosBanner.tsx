import { useSubscription } from '@apollo/client'
import { useEffect, useRef, useState } from 'react'
import { VIDEOS_SUBSCRIPTION } from '../graphql/operations'
import type { Video } from '../types'

interface Props {
	/** Called when the user taps the banner: prepend buffered videos + scroll. */
	onShow: (videos: Video[]) => void
}

// Step 8: subscribe to newly published videos, buffer them, and surface a
// banner. Clicking flushes the buffer into the feed at the top.
export function NewVideosBanner({ onShow }: Props) {
	const [buffer, setBuffer] = useState<Video[]>([])
	const bufferRef = useRef<Video[]>([])
	const { data } = useSubscription(VIDEOS_SUBSCRIPTION)

	useEffect(() => {
		const video: Video | undefined = data?.videos
		if (!video) return
		if (bufferRef.current.some((v) => v.id === video.id)) return
		bufferRef.current = [video, ...bufferRef.current]
		setBuffer(bufferRef.current)
	}, [data])

	if (buffer.length === 0) return null

	return (
		<button
			onClick={() => {
				onShow(bufferRef.current)
				bufferRef.current = []
				setBuffer([])
			}}
			className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold shadow-lg transition hover:bg-pink-500"
		>
			↑ {buffer.length} new {buffer.length === 1 ? 'video' : 'videos'}
		</button>
	)
}
