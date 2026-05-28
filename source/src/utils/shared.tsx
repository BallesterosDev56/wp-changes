export function currencyFormat(price: number | string, currency: string) {
  const priceNumber = Number(price);
  // Check if the number has decimal places
  const hasDecimals = priceNumber % 1 !== 0;

  // Format the number with or without decimals
  const formattedNum =
    hasDecimals ||
    currency === "USD" ||
    currency === "EUR" ||
    currency === "GBP" ||
    currency === "CAD" ||
    currency === "AUD"
      ? priceNumber.toFixed(2)
      : priceNumber.toFixed(0);

  // Add commas for thousands separators
  const currencySymbols: { [key: string]: string } = {
    EUR: "€",
    GBP: "£",
  };

  const symbol = currencySymbols[currency] || "$";
  return symbol + formattedNum.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
