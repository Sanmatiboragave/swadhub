export function inr(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(n))
}

export function deliveryFee(subtotal) {
  if (subtotal <= 0) return 0
  return subtotal >= 499 ? 0 : 29
}

export function gst(subtotal) {
  return subtotal * 0.05
}
