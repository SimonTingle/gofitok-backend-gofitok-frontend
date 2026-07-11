import * as schema from '#/auth/auth.schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { drizzleClient } from './drizzle-client'

export const auth = betterAuth({
	database: drizzleAdapter(drizzleClient, {
		provider: 'pg',
		schema,
		usePlural: true,
	}),
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4000',
	trustedOrigins:
		process.env.TRUSTED_ORIGINS?.split(',').map((o) => o.trim()) ?? [],
	emailAndPassword: {
		enabled: true,
	},
	plugins: [admin()],
	user: {
		additionalFields: {
			biography: {
				type: 'string',
				required: false,
			},
		},
	},
})

export type AuthSession = Awaited<
	ReturnType<typeof auth.api.getSession>
>

export type AuthUser = NonNullable<AuthSession>['user']
