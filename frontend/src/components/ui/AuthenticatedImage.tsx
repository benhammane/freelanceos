import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { http } from '../../api/http'
import { Spinner } from './Spinner'

/**
 * Affiche une image servie par un endpoint AUTHENTIFIÉ. Une balise <img src>
 * classique ne peut pas envoyer l'en-tête Authorization : on récupère donc
 * l'image via axios (l'intercepteur ajoute le token), on la transforme en
 * "object URL" local, puis on l'affiche. L'URL est révoquée au démontage pour
 * éviter les fuites mémoire.
 */
export function AuthenticatedImage({
  src,
  alt,
  className = '',
}: {
  src: string
  alt: string
  className?: string
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [erreur, setErreur] = useState(false)

  useEffect(() => {
    let annule = false
    let urlCree: string | null = null
    setErreur(false)
    setObjectUrl(null)

    http
      .get(src, { responseType: 'blob' })
      .then((res) => {
        if (annule) return
        urlCree = URL.createObjectURL(res.data)
        setObjectUrl(urlCree)
      })
      .catch(() => {
        if (!annule) setErreur(true)
      })

    return () => {
      annule = true
      if (urlCree) URL.revokeObjectURL(urlCree)
    }
  }, [src])

  if (erreur) {
    return (
      <div className={`flex items-center justify-center bg-navy-100 text-navy-400 dark:bg-navy-800 ${className}`}>
        <ImageOff className="h-5 w-5" />
      </div>
    )
  }

  if (!objectUrl) {
    return (
      <div className={`flex items-center justify-center bg-navy-100 text-navy-400 dark:bg-navy-800 ${className}`}>
        <Spinner />
      </div>
    )
  }

  return <img src={objectUrl} alt={alt} className={className} />
}
