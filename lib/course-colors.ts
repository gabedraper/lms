const GRADIENTS = [
  "from-rose-500 to-orange-400",
  "from-violet-600 to-pink-500",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-red-500",
  "from-indigo-600 to-violet-500",
  "from-pink-500 to-rose-400",
  "from-sky-500 to-cyan-400",
  "from-green-500 to-emerald-400",
  "from-orange-500 to-amber-400",
  "from-fuchsia-600 to-pink-500",
  "from-blue-600 to-sky-400",
  "from-red-500 to-pink-500",
  "from-teal-500 to-green-400",
  "from-purple-600 to-indigo-500",
  "from-yellow-500 to-orange-500",
  "from-lime-500 to-green-500",
  "from-blue-500 to-violet-600",
  "from-rose-600 to-pink-400",
  "from-cyan-600 to-teal-500",
];

export function getCourseGradient(id: string): string {
  // Deterministic pick based on id characters
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % GRADIENTS.length;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}
