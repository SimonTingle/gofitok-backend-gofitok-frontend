import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils'
import { GraphQLError } from 'graphql'
import { defaultFieldResolver } from 'graphql/execution/execute'
import type { GraphQLContext } from '#/shared/context'

const directiveName = 'auth'

function assertAuthorized(context: GraphQLContext, enabledRoles: string[]) {
	const user = context.user

	if (!user) {
		throw new GraphQLError('Not authenticated', {
			extensions: { code: 'UNAUTHENTICATED' },
		})
	}

	// users.role is free text ('admin' | 'user' | null); map to the Role enum.
	const role = (user.role ?? 'user').toUpperCase()

	if (enabledRoles.length && !enabledRoles.includes(role)) {
		throw new GraphQLError('Not authorized', {
			extensions: { code: 'FORBIDDEN' },
		})
	}
}

export function auth() {
	return (schema: any) =>
		mapSchema(schema, {
			[MapperKind.OBJECT_FIELD]: (fieldConfig) => {
				const authDirective = getDirective(
					schema,
					fieldConfig,
					directiveName,
				)?.[0]

				if (!authDirective) return

				const enabledRoles: string[] = authDirective.requires ?? []

				// Guard subscriptions at subscribe time (the field has `subscribe`,
				// not `resolve`); guard queries/mutations at resolve time.
				if (fieldConfig.subscribe) {
					const { subscribe } = fieldConfig
					fieldConfig.subscribe = (source: any, args: any, context: any, info: any) => {
						assertAuthorized(context, enabledRoles)
						return subscribe(source, args, context, info)
					}
				} else {
					const { resolve = defaultFieldResolver } = fieldConfig
					fieldConfig.resolve = (source: any, args: any, context: any, info: any) => {
						assertAuthorized(context, enabledRoles)
						return resolve(source, args, context, info)
					}
				}

				return fieldConfig
			},
		})
}
