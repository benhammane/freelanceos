import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Zap } from 'lucide-react'
import { authApi } from '../api/auth'
import { messageErreur } from '../api/http'
import { useAuth } from '../context/AuthContext'
import { InputField } from '../components/ui/Field'
import { Button } from '../components/ui/Button'

export default function Login() {
  const { connecter } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enCours, setEnCours] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setEnCours(true)
    try {
      const reponse = await authApi.login(email, password)
      connecter(reponse)
      navigate(reponse.role === 'ADMIN' ? '/' : '/portail', { replace: true })
    } catch (err) {
      toast.error(messageErreur(err))
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-50 px-4 dark:bg-[var(--app-bg)]">
      {/* Halo décoratif subtil en arrière-plan */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative w-full max-w-sm">
        {/* Logo + marque */}
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg">
            <Zap className="h-6 w-6 text-white" fill="currentColor" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-navy-900 dark:text-white">FreelanceOS</h1>
          <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">Connectez-vous à votre espace</p>
        </div>

        {/* Carte de connexion */}
        <div className="rounded-2xl border border-navy-200/80 bg-white p-7 shadow-lg dark:border-navy-800 dark:bg-navy-900">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="Email"
              type="email"
              required
              autoComplete="email"
              placeholder="vous@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField
              label="Mot de passe"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" size="lg" loading={enCours} className="mt-2 w-full">
              {enCours ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-navy-400">
          © {new Date().getFullYear()} FreelanceOS — Gestion d'activité freelance
        </p>
      </div>
    </div>
  )
}
