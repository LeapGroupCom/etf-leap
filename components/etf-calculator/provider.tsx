'use client'

import { createStoreContext } from 'leo-query'
import { createEtfCalcStore } from './store'

export const {
	Provider: EtfCalcStoreProvider,
	Context: EtfCalcContext,
	useStore: useEtfCalcStore,
	useStoreAsync: useEtfCalcStoreAsync,
	useStoreSuspense: useEtfCalcStoreSuspense,
} = createStoreContext(createEtfCalcStore)
