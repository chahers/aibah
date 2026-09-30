export default function SoldOutBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-block rounded-full bg-oxblood px-3.5 py-1.5 text-sm text-blush ${className}`}>Sold out</span>
  )
}
