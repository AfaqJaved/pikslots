const CURRENCY_SYMBOLS: Record<string, string> = {
	PKR: 'Rs',
	USD: '$',
	RUB: '₽'
};

export function formatCost(cost: number, currency: string) {
	if (cost === 0) return 'Free';
	if (CURRENCY_SYMBOLS[currency]) {
		return `${CURRENCY_SYMBOLS[currency]} ${cost.toFixed(2)}`;
	}
}
