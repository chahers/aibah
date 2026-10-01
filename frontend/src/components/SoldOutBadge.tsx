export default function SoldOutBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-block rounded-full bg-smoke px-3.5 py-1.5 text-sm text-sky ${className}`}>Sold out</span>
  )
}
