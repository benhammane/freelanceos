import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'

const CLE_STOCKAGE_THEME = 'freelanceos.theme'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function themeInitial(): Theme {
  const stocke = localStorage.getItem(CLE_STOCKAGE_THEME)
  if (stocke === 'light' || stocke === 'dark') return stocke
  // À défaut de préférence enregistrée, on suit le réglage système.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Gère le thème clair/sombre de l'application. Le thème est persisté dans le
 * localStorage et appliqué en posant/retirant la classe `.dark` sur <html>,
 * ce qui active toutes les variantes `dark:` de Tailwind et fait basculer les
 * variables CSS sémantiques du design system (voir index.css).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(themeInitial)

  useEffect(() => {
    const racine = document.documentElement
    racine.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(CLE_STOCKAGE_THEME, theme)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme doit être utilisé à l\'intérieur de <ThemeProvider>')
  return context
}
