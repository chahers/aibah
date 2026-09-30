import { useEffect, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from './Icons'

const messages: ReactNode[] = [
  'Join the movement.',
  <>
    Just launched: <em>COLLECTION 00</em> BANGKIT.
  </>,
  <span className="uppercase">Complimentary delivery across Malaysia</span>,
]

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 5000)
    return () => window.clearInterval(id)
  }, [paused])

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + messages.length) % messages.length)

  return (
    <div
      className="relative flex h-11 items-center justify-center bg-black px-12 text-sm text-white md:h-12"
      role="region"
      aria-label="Announcements"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous announcement"
        className="absolute left-2 grid h-8 w-8 place-items-center"
      >
        <ChevronLeft width={18} height={18} />
      </button>
      <p className="text-center" aria-live="polite">
        {messages[index]}
      </p>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next announcement"
        className="absolute right-2 grid h-8 w-8 place-items-center"
      >
        <ChevronRight width={18} height={18} />
      </button>
    </div>
  )
}
