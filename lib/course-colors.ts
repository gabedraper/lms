const GRADIENTS: [string, string][] = [
  ["#f43f5e", "#fb923c"], // rose → orange
  ["#7c3aed", "#ec4899"], // violet → pink
  ["#06b6d4", "#2563eb"], // cyan → blue
  ["#10b981", "#14b8a6"], // emerald → teal
  ["#f59e0b", "#ef4444"], // amber → red
  ["#4f46e5", "#7c3aed"], // indigo → violet
  ["#ec4899", "#f43f5e"], // pink → rose
  ["#0ea5e9", "#06b6d4"], // sky → cyan
  ["#22c55e", "#10b981"], // green → emerald
  ["#f97316", "#f59e0b"], // orange → amber
  ["#d946ef", "#ec4899"], // fuchsia → pink
  ["#2563eb", "#0ea5e9"], // blue → sky
  ["#ef4444", "#ec4899"], // red → pink
  ["#14b8a6", "#22c55e"], // teal → green
  ["#9333ea", "#4f46e5"], // purple → indigo
  ["#eab308", "#f97316"], // yellow → orange
  ["#84cc16", "#22c55e"], // lime → green
  ["#3b82f6", "#7c3aed"], // blue → violet
  ["#e11d48", "#f472b6"], // rose → pink light
  ["#0891b2", "#0d9488"], // cyan dark → teal dark
];

export function getCourseGradientStyle(id: string): React.CSSProperties {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % GRADIENTS.length;
  }
  const [from, to] = GRADIENTS[Math.abs(hash) % GRADIENTS.length];
  return { background: `linear-gradient(135deg, ${from}, ${to})` };
}

export function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}
