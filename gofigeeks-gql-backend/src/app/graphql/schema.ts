import { makeExecutableSchema } from '@graphql-tools/schema'
import { auth } from './directives/auth'
import { resolvers } from './resolvers'
import { typeDefs } from './type-defs'

const executableSchema = makeExecutableSchema({
	typeDefs,
	resolvers,
})

const directives = [auth()]

export const schema = directives.reduce(
	(schema, directive) => directive(schema),
	executableSchema,
)
