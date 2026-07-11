import { useMutation } from '@apollo/client'
import { type FormEvent, useState } from 'react'
import { PUBLISH_VIDEO, UPLOAD } from '../graphql/operations'

interface Props {
	onClose: () => void
}

// Uploads the picked files to storage (upload mutation → URL), then publishes.
// The published video reaches every open feed (incl. this one) via the
// `videos` subscription, so we don't need to touch feed state here.
export function UploadModal({ onClose }: Props) {
	const [upload] = useMutation(UPLOAD)
	const [publish] = useMutation(PUBLISH_VIDEO)
	const [description, setDescription] = useState('')
	const [videoFile, setVideoFile] = useState<File | null>(null)
	const [thumbFile, setThumbFile] = useState<File | null>(null)
	const [status, setStatus] = useState<string | null>(null)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function uploadOne(file: File): Promise<string> {
		const res = await upload({ variables: { file } })
		return res.data.upload as string
	}

	async function onSubmit(e: FormEvent) {
		e.preventDefault()
		if (!videoFile) return
		setBusy(true)
		setError(null)
		try {
			setStatus('Uploading video…')
			const url = await uploadOne(videoFile)

			let thumbnailUrl: string | undefined
			if (thumbFile) {
				setStatus('Uploading thumbnail…')
				thumbnailUrl = await uploadOne(thumbFile)
			}

			setStatus('Publishing…')
			await publish({
				variables: {
					url,
					description: description.trim() || null,
					thumbnailUrl,
				},
			})
			onClose()
		} catch {
			setError('Upload failed. Please try again.')
			setStatus(null)
		} finally {
			setBusy(false)
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			onClick={onClose}
		>
			<form
				onClick={(e) => e.stopPropagation()}
				onSubmit={onSubmit}
				className="w-full max-w-md rounded-2xl bg-neutral-900 p-6"
			>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-bold">Upload a video</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-neutral-400 hover:text-white"
					>
						✕
					</button>
				</div>

				<label className="mb-4 block">
					<span className="mb-1 block text-xs text-neutral-400">
						Description
					</span>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={2}
						placeholder="Say something about your video…"
						className="w-full resize-none rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
					/>
				</label>

				<label className="mb-4 block">
					<span className="mb-1 block text-xs text-neutral-400">
						Video file *
					</span>
					<input
						type="file"
						accept="video/*"
						required
						onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
						className="w-full text-sm text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-pink-600 file:px-3 file:py-1.5 file:text-white"
					/>
				</label>

				<label className="mb-4 block">
					<span className="mb-1 block text-xs text-neutral-400">
						Thumbnail (optional)
					</span>
					<input
						type="file"
						accept="image/*"
						onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)}
						className="w-full text-sm text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-700 file:px-3 file:py-1.5 file:text-white"
					/>
				</label>

				{error && <p className="mb-3 text-sm text-red-400">{error}</p>}

				<button
					type="submit"
					disabled={busy || !videoFile}
					className="w-full rounded-lg bg-pink-600 py-2 font-semibold transition hover:bg-pink-500 disabled:opacity-50"
				>
					{busy ? (status ?? 'Working…') : 'Publish'}
				</button>
			</form>
		</div>
	)
}
