export const formatPrice = (price: number | null | undefined) => {
  if (price === null || price === undefined) return "N/A";
  return `${Math.round(price).toLocaleString()} €`;
};
