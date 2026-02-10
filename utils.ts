
export const formatSilver = (value: number): string => {
  if (value >= 1000000000) return (value / 1000000000).toFixed(1) + 'B';
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toString();
};

export const calculateTotalLoss = (builds: { value: number }[]): number => {
  return builds.reduce((acc, curr) => acc + curr.value, 0);
};

export const parseSilverShorthand = (input: string | number): number => {
  if (typeof input === 'number') return input;
  
  const clean = input.toLowerCase().trim().replace(',', '.');
  if (!clean) return 0;

  let multiplier = 1;
  let numString = clean;

  if (clean.endsWith('k')) {
    multiplier = 1000;
    numString = clean.slice(0, -1);
  } else if (clean.endsWith('m')) {
    multiplier = 1000000;
    numString = clean.slice(0, -1);
  } else if (clean.endsWith('b')) {
    multiplier = 1000000000;
    numString = clean.slice(0, -1);
  }

  const value = parseFloat(numString);
  return isNaN(value) ? 0 : Math.floor(value * multiplier);
};
