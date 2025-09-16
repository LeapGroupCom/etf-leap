export const isNullish = <T>(x: T | null | undefined): x is null | undefined => {
	return x == null
}

export const isNotNullish = <T>(x: T | null | undefined): x is T => {
	return x != null
}

export const isEmpty = <T extends string>(value: T | ''): value is '' => value === ''

export const isNotEmpty = <T extends string>(value: T): value is Exclude<T, ''> => value !== ''

export const isValueOf =
	<T extends string>(arr: readonly T[]) =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(value: any): value is T => {
		return arr.includes(value)
	}

export const entries = <K extends string, V = unknown>(value: Record<K, V>) => {
	return Object.entries(value) as [K, V][]
}
