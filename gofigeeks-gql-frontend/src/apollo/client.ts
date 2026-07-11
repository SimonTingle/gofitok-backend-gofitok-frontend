import {
	ApolloClient,
	ApolloLink,
	InMemoryCache,
	Observable,
	split,
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { createUploadLink } from 'apollo-upload-client'
import { print } from 'graphql'
import { createClient } from 'graphql-sse'

const uri = import.meta.env.VITE_API_URL

// HTTP link (queries + mutations, incl. multipart file uploads). `credentials:
// 'include'` sends the better-auth session cookie cross-origin.
const httpLink = createUploadLink({
	uri,
	credentials: 'include',
})

// Subscriptions over Server-Sent Events (graphql-sse), matching the backend's
// GraphQL Yoga SSE transport. Cookies flow automatically (same fetch creds).
const sseClient = createClient({
	url: uri,
	credentials: 'include',
})

const sseLink = new ApolloLink((operation) => {
	return new Observable((observer) => {
		const { query, variables, operationName, extensions } = operation
		return sseClient.subscribe(
			{
				query: print(query),
				variables,
				operationName,
				extensions,
			},
			{
				next: (data) => observer.next(data as any),
				error: (err) => observer.error(err),
				complete: () => observer.complete(),
			},
		)
	})
})

// Route subscriptions to SSE; everything else to HTTP.
const link = split(
	({ query }) => {
		const definition = getMainDefinition(query)
		return (
			definition.kind === 'OperationDefinition' &&
			definition.operation === 'subscription'
		)
	},
	sseLink,
	httpLink,
)

// Cache disabled per the workshop guardrail — every operation hits the network.
export const client = new ApolloClient({
	link,
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: { fetchPolicy: 'no-cache' },
		query: { fetchPolicy: 'no-cache' },
		mutate: { fetchPolicy: 'no-cache' },
	},
})
