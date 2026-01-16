import type { CodegenConfig } from '@graphql-codegen/cli'
import 'dotenv/config'
import { serverEnv } from './serverEnv'

const config: CodegenConfig = {
	overwrite: true,
	schema: {
		[`${serverEnv.WORDPRESS_URL}/graphql`]: {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Basic ${Buffer.from(`${serverEnv.WP_USER}:${serverEnv.WP_APP_PASSWORD}`).toString('base64')}`,
			},
		},
	},
	documents: ['app/**/*.gql', 'graphql/**/*.gql', 'components/**/*.gql'],
	generates: {
		'graphql/generated/graphql.ts': {
			plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
			config: {
				enumsAsTypes: true,
				declarationKind: 'type',
				skipTypename: false,
				strictScalars: true,
				avoidOptionals: true,
				scalars: {
					BlockAttributesArray: 'unknown',
					BlockAttributesObject: 'unknown',
				},
			},
		},
		'graphql/generated/schema.gql': {
			plugins: ['schema-ast'],
		},
	},
}

export default config
