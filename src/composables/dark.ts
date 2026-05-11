// Theme toggle that drives DaisyUI v5's `data-theme` attribute on <html>.
export const isDark = useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
})
export const toggleDark = useToggle(isDark)
export const preferredDark = usePreferredDark()
