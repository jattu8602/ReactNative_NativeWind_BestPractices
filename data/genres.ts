export interface GenreConfig {
  name: string
  color: string // RGB rgba format
  emoji: string
}

// Comprehensive list of anime genres with colors and emojis
export const genres: GenreConfig[] = [
  // Core Genres
  { name: 'Action', color: 'rgba(239, 68, 68, 0.9)', emoji: '💥' },
  { name: 'Adventure', color: 'rgba(249, 115, 22, 0.9)', emoji: '🗺️' },
  { name: 'Comedy', color: 'rgba(234, 179, 8, 0.9)', emoji: '😂' },
  { name: 'Drama', color: 'rgba(59, 130, 246, 0.9)', emoji: '🎭' },
  { name: 'Fantasy', color: 'rgba(168, 85, 247, 0.9)', emoji: '🧙' },
  { name: 'Horror', color: 'rgba(127, 29, 29, 0.9)', emoji: '👻' },
  { name: 'Romance', color: 'rgba(236, 72, 153, 0.9)', emoji: '💖' },
  { name: 'Sci-Fi', color: 'rgba(6, 182, 212, 0.9)', emoji: '🚀' },
  { name: 'Science Fiction', color: 'rgba(6, 182, 212, 0.9)', emoji: '🚀' },
  { name: 'Slice of Life', color: 'rgba(34, 197, 94, 0.9)', emoji: '🍃' },
  { name: 'Sports', color: 'rgba(245, 158, 11, 0.9)', emoji: '🏆' },
  { name: 'Supernatural', color: 'rgba(99, 102, 241, 0.9)', emoji: '👁️' },
  { name: 'Mystery', color: 'rgba(30, 64, 175, 0.9)', emoji: '🕵️' },
  { name: 'Thriller', color: 'rgba(185, 28, 28, 0.9)', emoji: '🔪' },
  { name: 'Psychological', color: 'rgba(139, 92, 246, 0.9)', emoji: '🧠' },
  { name: 'Suspense', color: 'rgba(185, 28, 28, 0.9)', emoji: '⚡' },

  // Anime-Specific Genres
  { name: 'Isekai', color: 'rgba(20, 184, 166, 0.9)', emoji: '🌐' },
  { name: 'Mecha', color: 'rgba(107, 114, 128, 0.9)', emoji: '🤖' },
  { name: 'Shounen', color: 'rgba(59, 130, 246, 0.9)', emoji: '⚔️' },
  { name: 'Shoujo', color: 'rgba(236, 72, 153, 0.9)', emoji: '💕' },
  { name: 'Seinen', color: 'rgba(99, 102, 241, 0.9)', emoji: '🎯' },
  { name: 'Josei', color: 'rgba(244, 63, 94, 0.9)', emoji: '🌸' },
  { name: 'Mahou Shoujo', color: 'rgba(168, 85, 247, 0.9)', emoji: '✨' },
  { name: 'Magical Girl', color: 'rgba(168, 85, 247, 0.9)', emoji: '✨' },
  { name: 'Ecchi', color: 'rgba(251, 113, 133, 0.9)', emoji: '😏' },
  { name: 'Harem', color: 'rgba(236, 72, 153, 0.9)', emoji: '👥' },
  { name: 'Yaoi', color: 'rgba(59, 130, 246, 0.9)', emoji: '💙' },
  { name: 'Yuri', color: 'rgba(236, 72, 153, 0.9)', emoji: '💜' },
  { name: 'Boys Love', color: 'rgba(59, 130, 246, 0.9)', emoji: '💙' },
  { name: 'Girls Love', color: 'rgba(236, 72, 153, 0.9)', emoji: '💜' },
  { name: 'Shounen Ai', color: 'rgba(59, 130, 246, 0.9)', emoji: '💙' },
  { name: 'Shoujo Ai', color: 'rgba(236, 72, 153, 0.9)', emoji: '💜' },

  // Niche Genres
  { name: 'Gourmet', color: 'rgba(245, 158, 11, 0.9)', emoji: '🍜' },
  { name: 'Music', color: 'rgba(168, 85, 247, 0.9)', emoji: '🎵' },
  { name: 'Military', color: 'rgba(107, 114, 128, 0.9)', emoji: '🎖️' },
  { name: 'Police', color: 'rgba(30, 64, 175, 0.9)', emoji: '🚔' },
  { name: 'Samurai', color: 'rgba(127, 29, 29, 0.9)', emoji: '⚔️' },
  { name: 'Space', color: 'rgba(14, 165, 233, 0.9)', emoji: '🌌' },
  { name: 'Vampire', color: 'rgba(185, 28, 28, 0.9)', emoji: '🦇' },
  { name: 'Zombies', color: 'rgba(127, 29, 29, 0.9)', emoji: '🧟' },
  { name: 'Parody', color: 'rgba(234, 179, 8, 0.9)', emoji: '🎪' },
  { name: 'School', color: 'rgba(34, 197, 94, 0.9)', emoji: '🏫' },
  { name: 'Martial Arts', color: 'rgba(239, 68, 68, 0.9)', emoji: '🥋' },
  { name: 'Super Power', color: 'rgba(139, 92, 246, 0.9)', emoji: '⚡' },
  { name: 'Kids', color: 'rgba(34, 197, 94, 0.9)', emoji: '🎈' },
  { name: 'Cars', color: 'rgba(107, 114, 128, 0.9)', emoji: '🏎️' },
  { name: 'Avant Garde', color: 'rgba(168, 85, 247, 0.9)', emoji: '🎨' },
  { name: 'Award Winning', color: 'rgba(245, 158, 11, 0.9)', emoji: '🏅' },
  { name: 'Game', color: 'rgba(139, 92, 246, 0.9)', emoji: '🎮' },
  { name: 'Demons', color: 'rgba(127, 29, 29, 0.9)', emoji: '😈' },
  { name: 'Magic', color: 'rgba(168, 85, 247, 0.9)', emoji: '🔮' },
  { name: 'Historical', color: 'rgba(107, 114, 128, 0.9)', emoji: '📜' },
  { name: 'Hentai', color: 'rgba(185, 28, 28, 0.9)', emoji: '🔞' },
  { name: 'Erotica', color: 'rgba(185, 28, 28, 0.9)', emoji: '🔞' },
]

// Default fallback config
const defaultGenreConfig: GenreConfig = {
  name: 'Unknown',
  color: 'rgba(107, 114, 128, 0.9)', // Gray
  emoji: '🎬',
}

/**
 * Get genre configuration by name
 * Performs case-insensitive matching and handles common variations
 * @param genreName - The name of the genre to look up
 * @returns GenreConfig with color and emoji, or default fallback
 */
export const getGenreConfig = (
  genreName: string | null | undefined
): GenreConfig => {
  // Handle edge cases
  if (!genreName || typeof genreName !== 'string') {
    return defaultGenreConfig
  }

  // Normalize the genre name: trim, lowercase, and handle common variations
  const normalized = genreName.trim().toLowerCase()

  // Try exact match first
  const exactMatch = genres.find(
    (genre) => genre.name.toLowerCase() === normalized
  )
  if (exactMatch) {
    return exactMatch
  }

  // Try partial match (handles cases like "Sci-Fi" matching "Science Fiction")
  const partialMatch = genres.find((genre) => {
    const genreNormalized = genre.name.toLowerCase()
    return (
      normalized.includes(genreNormalized) ||
      genreNormalized.includes(normalized)
    )
  })
  if (partialMatch) {
    return partialMatch
  }

  // Return default if no match found
  return defaultGenreConfig
}
