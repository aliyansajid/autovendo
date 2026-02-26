export const getRegistrationYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= 1900; year--) {
    years.push({ value: year.toString(), label: year.toString() });
  }

  return years;
};

export const mileages = [
  ...Array.from({ length: 11 }, (_, i) => (i === 0 ? 5000 : i * 10000)),
  125000,
  150000,
  175000,
  200000,
].map((m) => ({
  value: m.toString(),
  label: `${m.toLocaleString("de-DE")} km`,
}));
