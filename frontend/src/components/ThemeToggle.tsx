import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { IconButton } from './ui/IconButton'

/** Bascule clair / sombre, avec une petite transition d'icône. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <IconButton label={theme === 'dark' ? 'Passer en clair' : 'Passer en sombre'} onClick={toggleTheme}>
      {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </IconButton>
  )
}
