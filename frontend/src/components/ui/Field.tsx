import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'

/**
 * Enveloppe commune (label + message d'erreur) pour tous les champs de
 * formulaire de l'application, afin d'afficher les erreurs de validation de
 * façon cohérente et élégante sur chaque page.
 */
function FieldWrapper({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-navy-700 dark:text-navy-200">
        {label}
        {required && <span className="text-cyan-500"> *</span>}
      </span>
      {children}
      {error && (
        <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </span>
      )}
    </label>
  )
}

/* Base commune : grands champs, focus élégant (anneau bleu translucide), sombre. */
const INPUT_CLASS =
  'w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-800 shadow-xs outline-none transition-all duration-150 placeholder:text-navy-400 ' +
  'focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/12 ' +
  'dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100 dark:placeholder:text-navy-500 dark:focus:border-cyan-500'

const ERROR_CLASS = 'border-red-400 focus:border-red-500 focus:ring-red-500/12 dark:border-red-500/60'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function InputField({ label, error, required, className = '', ...props }: InputFieldProps) {
  return (
    <FieldWrapper label={label} error={error} required={required}>
      <input className={`${INPUT_CLASS} ${error ? ERROR_CLASS : ''} ${className}`} {...props} />
    </FieldWrapper>
  )
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function TextareaField({ label, error, required, className = '', ...props }: TextareaFieldProps) {
  return (
    <FieldWrapper label={label} error={error} required={required}>
      <textarea className={`${INPUT_CLASS} resize-y ${error ? ERROR_CLASS : ''} ${className}`} rows={3} {...props} />
    </FieldWrapper>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function SelectField({ label, error, required, className = '', children, ...props }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} error={error} required={required}>
      <select className={`${INPUT_CLASS} cursor-pointer ${error ? ERROR_CLASS : ''} ${className}`} {...props}>
        {children}
      </select>
    </FieldWrapper>
  )
}
