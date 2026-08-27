export const games = [
  {
    slug: 'barah-goti',
    name: 'Barah Goti',
    alternateName: 'Bagh-Bakri',
    description: 'A sharp, satisfying hunt between the tiger and the goats.',
    players: '2 players',
    category: 'Strategy',
    playable: true,
    accent: 'saffron',
    icon: '◈',
    howItWorks: 'One player commands the tiger. The other guides twelve goats to surround it. Every move is a small act of patience, position, and nerve.',
  },
  {
    slug: 'solah-goti', name: 'Solah Goti', description: 'Sixteen pieces, one open board, and a battle of wits.', players: '2 players', category: 'Strategy', playable: false, accent: 'teal', icon: '✦',
  },
  {
    slug: 'atha-goti', name: 'Atha Goti', description: 'The classic capture game where every corner matters.', players: '2 players', category: 'Classic', playable: false, accent: 'coral', icon: '✧',
  },
  {
    slug: 'bagh-chal', name: 'Bagh-Chal', description: 'A Nepalese-Indian classic: four tigers versus twenty goats.', players: '2 players', category: 'Strategy', playable: false, accent: 'mustard', icon: '◇',
  },
  {
    slug: 'chowka-bara', name: 'Chowka Bara', description: 'Roll, race, and send your tokens home in this Kannada favourite.', players: '2–4 players', category: 'Race', playable: false, accent: 'teal', icon: '⊞',
  },
  {
    slug: 'pallankuzhi', name: 'Pallankuzhi', description: 'Count, sow, and gather your way through an ancient Tamil board.', players: '2 players', category: 'Counting', playable: false, accent: 'saffron', icon: '••',
  },
  {
    slug: 'kaudi', name: 'Kaudi', description: 'A playful shell game filled with chance, memory, and momentum.', players: '2–4 players', category: 'Chance', playable: false, accent: 'coral', icon: '⌁',
  },
  {
    slug: 'pachisi', name: 'Pachisi', description: 'The royal cross-shaped race game that travelled the world.', players: '2–4 players', category: 'Race', playable: false, accent: 'mustard', icon: '✚',
  },
  {
    slug: 'chaupar', name: 'Chaupar', description: 'A strategic cousin to Pachisi, played with cloth and cowries.', players: '2–4 players', category: 'Race', playable: false, accent: 'teal', icon: '⊕',
  },
  {
    slug: 'mancala', name: 'Mancala', description: 'A global family of sowing games with deep Indian roots.', players: '2 players', category: 'Counting', playable: false, accent: 'saffron', icon: '∷',
  },
]

export function getGame(slug) {
  return games.find((game) => game.slug === slug)
}