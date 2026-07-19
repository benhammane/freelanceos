import ReactMarkdown from 'react-markdown'

/**
 * Rendu Markdown stylé "à la main" (sans plugin Tailwind typography, pour ne
 * pas ajouter une dépendance supplémentaire) : chaque élément Markdown est
 * mappé vers ses propres classes, cohérentes avec le design system de l'app.
 */
export function MarkdownPreview({ contenu }: { contenu: string }) {
  if (!contenu.trim()) {
    return <p className="text-sm italic text-navy-400">Rien à prévisualiser pour le moment.</p>
  }

  return (
    <div className="max-w-none text-sm leading-relaxed text-navy-700 dark:text-navy-200">
      <ReactMarkdown
        components={{
          h1: (props) => <h1 className="mb-3 mt-6 text-xl font-semibold text-navy-900 first:mt-0 dark:text-white" {...props} />,
          h2: (props) => <h2 className="mb-2 mt-5 text-lg font-semibold text-navy-900 first:mt-0 dark:text-white" {...props} />,
          h3: (props) => <h3 className="mb-2 mt-4 text-base font-semibold text-navy-800 first:mt-0 dark:text-navy-100" {...props} />,
          p: (props) => <p className="mb-3 last:mb-0" {...props} />,
          ul: (props) => <ul className="mb-3 ml-5 list-disc space-y-1" {...props} />,
          ol: (props) => <ol className="mb-3 ml-5 list-decimal space-y-1" {...props} />,
          li: (props) => <li {...props} />,
          a: (props) => <a className="text-cyan-600 underline hover:text-cyan-700 dark:text-cyan-400" target="_blank" rel="noopener noreferrer" {...props} />,
          code: (props) => (
            <code className="rounded bg-navy-100 px-1.5 py-0.5 font-mono text-[13px] text-navy-800 dark:bg-navy-800 dark:text-navy-100" {...props} />
          ),
          pre: (props) => (
            <pre className="mb-3 overflow-x-auto rounded-xl bg-navy-100 p-3 font-mono text-[13px] dark:bg-navy-800" {...props} />
          ),
          blockquote: (props) => (
            <blockquote className="mb-3 border-l-2 border-cyan-400 pl-3 italic text-navy-500 dark:text-navy-400" {...props} />
          ),
          hr: () => <hr className="my-4 border-navy-200 dark:border-navy-800" />,
          strong: (props) => <strong className="font-semibold text-navy-900 dark:text-white" {...props} />,
        }}
      >
        {contenu}
      </ReactMarkdown>
    </div>
  )
}
