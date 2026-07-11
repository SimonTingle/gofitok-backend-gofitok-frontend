import { drizzle } from 'drizzle-orm/postgres-js'

export const drizzleClient = drizzle({
	connection: process.env.DATABASE_URL!,
	casing: 'snake_case',
	logger: true,
})
