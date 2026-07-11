import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Video } from '../types'
import { LikeButton } from './LikeButton'

interface Props {
	video: Video
	onLikeChange: (videoId: string, likes: number, likedByMe: boolean) => void
	/** Fires when this card becomes the dominant one on screen. */
	onVisible: (videoId: string) => void
}

export function VideoCard({ video, onLikeChange, onVisible }: Props) {
	const containerRef = useRef<HTMLDivElement>(null)
	const videoRef = useRef<HTMLVideoElement>(null)

	// Autoplay (muted) when scrolled into view, pause when it leaves. Also mark
	// this video as the active one so the feed can live-refresh its likes.
	useEffect(() => {
		const el = containerRef.current
		const vid = videoRef.current
		if (!el) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
					onVisible(video.id)
					vid?.play().catch(() => {})
				} else {
					vid?.pause()
				}
			},
			{ threshold: [0, 0.6, 1] },
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [video.id, onVisible])

	return (
		<div
			ref={containerRef}
			className="flex h-full w-full snap-start snap-always items-center justify-center"
		>
			<div className="relative h-full w-full max-w-[440px] overflow-hidden bg-neutral-950">
				<video
					ref={videoRef}
					src={video.url}
					poster={video.thumbnailUrl ?? undefined}
					className="h-full w-full object-cover"
					loop
					muted
					playsInline
				/>

				{/* Overlay: creator + description */}
				<div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4">
					<div className="pointer-events-auto max-w-[80%]">
						<Link
							to={`/profile/${video.creator.id}`}
							className="flex items-center gap-2"
						>
							{video.creator.image ? (
								<img
									src={video.creator.image}
									alt=""
									className="h-9 w-9 rounded-full object-cover"
								/>
							) : (
								<span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-600 text-sm font-bold">
									{video.creator.name.charAt(0)}
								</span>
							)}
							<span className="font-semibold">@{video.creator.name}</span>
						</Link>
						{video.description && (
							<p className="mt-2 text-sm text-neutral-200">
								{video.description}
							</p>
						)}
					</div>
				</div>

				{/* Right-side actions */}
				<div className="absolute bottom-6 right-3 flex flex-col items-center gap-4">
					<LikeButton
						videoId={video.id}
						likes={video.likes}
						likedByMe={video.likedByMe}
						onChange={(likes, likedByMe) =>
							onLikeChange(video.id, likes, likedByMe)
						}
					/>
				</div>
			</div>
		</div>
	)
}
