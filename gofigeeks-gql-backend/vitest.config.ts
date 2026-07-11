import { defineConfig } from 'vitest/config'
import './src/app/env'

export default defineConfig({
	test: {
		environment: 'node',
		// Serialize tests: they share one database and sign in/out.
		fileParallelism: false,
		env: {
			NODE_ENV: 'test',
		},
	},
	resolve: {
		alias: {
			'@': new URL('./src/app', import.meta.url).pathname,
			'#': new URL('./src/contexts', import.meta.url).pathname,
		},
	},
})
