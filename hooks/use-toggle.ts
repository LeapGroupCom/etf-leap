import { useCallback, useState } from "react"

export const useToggle = (
  initialValue: boolean
): [
  boolean,
  {
    open: () => void
    close: () => void
    toggle: () => void
  }
] => {
  const [value, setValue] = useState(initialValue)

  const open = useCallback(() => {
    setValue(true)
  }, [])

  const close = useCallback(() => {
    setValue(false)
  }, [])

  const toggle = useCallback(() => {
    setValue((value) => !value)
  }, [])

  return [value, { open, close, toggle }]
}
