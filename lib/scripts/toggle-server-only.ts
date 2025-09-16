import * as fs from 'fs/promises'
import * as path from 'path'

const COMMENTED_SERVER_ONLY = "// import 'server-only'"
const IMPORTED_SERVER_ONLY = "import 'server-only'"

const filePath = path.resolve(process.cwd(), process.argv[2])

console.log('filePath', filePath)

const isServerOnlyCommented = (fileContent: string) => {
	return fileContent.includes(COMMENTED_SERVER_ONLY)
}

const isServerOnlyImported = (fileContent: string) => {
	return fileContent.includes(IMPORTED_SERVER_ONLY)
}

const toggleServerOnly = (fileContent: string) => {
	if (isServerOnlyCommented(fileContent)) {
		console.log(`uncommenting server-only import in ${filePath}`)
		return fileContent.replace(COMMENTED_SERVER_ONLY, IMPORTED_SERVER_ONLY)
	}

	if (isServerOnlyImported(fileContent)) {
		console.log(`commenting server-only import in ${filePath}`)
		return fileContent.replace(IMPORTED_SERVER_ONLY, COMMENTED_SERVER_ONLY)
	}

	console.warn(`no server-only import found in ${filePath}`)
	return fileContent
}

const main = async () => {
	const fileContent = await fs.readFile(filePath, 'utf-8')
	const toggledFileContent = toggleServerOnly(fileContent)
	await fs.writeFile(filePath, toggledFileContent)
}

main()
