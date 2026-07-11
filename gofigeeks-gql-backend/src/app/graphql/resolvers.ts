import { GraphQLScalarType } from 'graphql'
import { resolvers as Scalars } from 'graphql-scalars'
import { authResolvers } from '#/auth/auth.resolvers'
import { videoResolvers } from '#/video/video.resolvers'
import { DataLoaders } from './shared/data-loaders'

// GraphQL Yoga parses multipart requests and injects native File objects as the
// argument values, so this scalar only needs to pass the value through.
const FileScalar = new GraphQLScalarType({
	name: 'File',
	description: 'The `File` scalar type represents a file upload.',
	parseValue: (value) => value,
	serialize: (value) => value,
})

export const resolvers = DataLoaders.appendResolvers({
	Query: {
		hello: () => 'Hello World!',
		...authResolvers.Query,
		...videoResolvers.Query,
	},
	Mutation: {
		...authResolvers.Mutation,
		...videoResolvers.Mutation,
	},
	Subscription: {
		...videoResolvers.Subscription,
	},
	// Video.creator and Video.likes are appended from loaders; likedByMe is a
	// user-scoped field resolver.
	Video: {
		...videoResolvers.Video,
	},
	File: FileScalar,
	...Scalars,
})
