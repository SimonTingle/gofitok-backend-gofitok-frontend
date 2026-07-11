import { loadFilesSync } from '@graphql-tools/load-files'
import { print } from 'graphql'
import { typeDefs as scalarTypeDefs } from 'graphql-scalars'

export const typeDefs = [
	scalarTypeDefs,
	...loadFilesSync('src/**/*.gql').map(print),
].join('\n')
