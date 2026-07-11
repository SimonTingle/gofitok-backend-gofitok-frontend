import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { UploadModal } from './UploadModal'

export function Layout() {
	const [uploadOpen, setUploadOpen] = useState(false)

	return (
		<div className="flex h-full">
			<Sidebar onUploadClick={() => setUploadOpen(true)} />
			<main className="relative h-full flex-1 overflow-hidden">
				<Outlet />
			</main>
			{uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
		</div>
	)
}
