export interface MultiBalance {
  currency: string;
  name: string;
  icon: string;
  balance: number;
  earned: number;
  spent: number;
}

const currencyFallbackIcons: Record<string, string> = {
  point: "🪙",
  diamond: "💎",
  gem: "💎",
  star: "⭐",
  coin: "🪙",
  ticket: "🎟️",
  coupon: "🎫",
};

export function getCurrencyIcon(code?: string, icon?: string | null) {
  if (icon && icon.trim()) return icon;
  if (!code) return "⭐";
  return currencyFallbackIcons[code.toLowerCase()] || "⭐";
}

export function getPrimaryBalance(balances: MultiBalance[]) {
  if (!balances.length) return null;
  return balances.find((item) => item.currency.toLowerCase() === "point") || balances[0];
}

export function getDiamondBalance(balances: MultiBalance[]) {
  if (!balances.length) return null;
  return balances.find((item) => item.currency.toLowerCase() === "diamond") || 
         balances.find((item) => item.currency.toLowerCase() === "gem") || null;
}

export function getSecondaryBalances(balances: MultiBalance[]) {
  const primary = getPrimaryBalance(balances);
  return balances.filter((item) => item.currency !== primary?.currency);
}
