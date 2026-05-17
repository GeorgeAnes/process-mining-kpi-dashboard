export function formatHours(value: number): string {
  if (value >= 24) return `${(value / 24).toFixed(1)}d`;
  return `${value.toFixed(1)}h`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatMoney(value: number): string {
  return `EUR ${Math.round(value).toLocaleString()}`;
}
