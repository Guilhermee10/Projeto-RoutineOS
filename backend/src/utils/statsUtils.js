function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((total, n) => total + n, 0);
  return sum / numbers.length;
}

function calculateMin(numbers) {
  if (numbers.length === 0) return 0;
  return Math.min(...numbers);
}

function calculateMax(numbers) {
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
}

module.exports = { calculateAverage, calculateMin, calculateMax };
