const PALETTE = [
  'bg-[#7c3728]',
  'bg-[#1e3a5f]',
  'bg-[#1f4d3a]',
  'bg-[#4c2a72]',
  'bg-[#7a3b12]',
  'bg-[#155e63]',
  'bg-[#6b2140]',
  'bg-[#3d4a22]',
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

export const teamColor = (name: string) => PALETTE[hash(name) % PALETTE.length];

export const teamInitials = (name: string) =>
  name
    .replace(/[«»"']/g, '')
    .trim()
    .slice(0, 2)
    .toUpperCase();
