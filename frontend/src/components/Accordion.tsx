import { useId, useState, type ReactNode } from 'react'
import { ChevronDown } from './Icons'

interface AccordionItemProps {
  title: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  titleClassName?: string
}

export function AccordionItem({ title, children, defaultOpen = false, titleClassName = '' }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  return (
    <div className="border-b border-black">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full items-center justify-between gap-4 py-5 text-left ${titleClassName}`}
        >
          <span>{title}</span>
          <ChevronDown width={18} height={18} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={id} role="region" className={`grid transition-[grid-template-rows] duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="pb-5 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}
