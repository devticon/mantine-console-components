export function formatPrice(amount: number, currencyCode = 'PLN') {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}
