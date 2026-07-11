import { defineConfig } from 'drizzle-kit'
import './src/app/env'

export default defineConfig({
	out: './drizzle',
	schema: './src/contexts/**/*.schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	casing: 'snake_case',
})
