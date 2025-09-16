module.exports = {
	parser: 'typescript',
	printWidth: 120,
	tabWidth: 2,
	useTabs: true,
	semi: false,
	singleQuote: true,
	trailingComma: 'es5',
	bracketSpacing: true,
	jsxBracketSameLine: false,
	arrowParens: 'avoid',
	plugins: ['prettier-plugin-organize-imports', 'prettier-plugin-tailwindcss'],
	overrides: [
		{
			files: ['*.gql', '*.graphql'],
			options: {
				parser: 'graphql',
			},
		},
	],
}
