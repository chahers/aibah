import { useState, type FormEvent } from 'react'
import { ArrowRight } from './Icons'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: connect to your email provider (Shopify Email, Klaviyo, Mailchimp...)
    setDone(true)
    setEmail('')
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <label htmlFor="newsletter-email" className="text-base">
        New drops. Brand updates. Events.
      </label>
      <div className="mt-4 flex items-center gap-3">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setDone(false)
          }}
          placeholder="Email address"
          className="h-14 min-w-0 flex-1 rounded-full border border-black bg-transparent px-6 text-lg placeholder:text-black/60"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-black bg-white transition-colors hover:bg-black hover:text-white"
        >
          <ArrowRight />
        </button>
      </div>
      <p className="mt-3 min-h-6 text-sm" role="status">
        {done ? 'Thanks. You are on the list.' : ''}
      </p>
    </form>
  )
}
