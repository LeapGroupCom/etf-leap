export const createNumberList = (from: number, to: number): number[] => {
	const result: number[] = []

	for (let i = from; i <= to; i += 1) {
		result.push(i)
	}

	return result
}