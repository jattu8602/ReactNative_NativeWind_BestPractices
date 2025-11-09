// Jikan.moe API - No API key required!
export const JIKAN_CONFIG = {
  BASE_URL: 'https://api.jikan.moe/v4',
}

// Helper function to map Jikan anime result to Movie interface (keeping name for compatibility)
const mapJikanToAnime = (anime: any, index: number): Movie => {
  const airedFrom = anime.aired?.from
    ? new Date(anime.aired.from).toISOString().split('T')[0]
    : '2024-01-01'

  return {
    id: anime.mal_id || index + 1000,
    title: anime.title || anime.title_english || '',
    adult: false,
    backdrop_path:
      anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
    genre_ids: anime.genres?.map((g: any) => g.mal_id) || [],
    original_language: 'ja',
    original_title: anime.title_japanese || anime.title || '',
    overview: anime.synopsis || '',
    popularity: anime.popularity || 0,
    poster_path: anime.images?.jpg?.image_url || '',
    release_date: airedFrom,
    video: false,
    vote_average: (anime.score || 0) * 2, // Convert 0-10 to 0-20 scale
    vote_count: anime.scored_by || 0,
  }
}

// Helper function to get popular anime
const getPopularAnime = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${JIKAN_CONFIG.BASE_URL}/top/anime?limit=20`)

    if (!response.ok) {
      throw new Error(`Failed to fetch anime: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.data && Array.isArray(data.data)) {
      return data.data.map((anime: any, idx: number) =>
        mapJikanToAnime(anime, idx)
      )
    }

    return []
  } catch (error) {
    console.error('Error fetching popular anime:', error)
    return []
  }
}

export const fetchMovies = async ({
  query,
}: {
  query: string
}): Promise<Movie[]> => {
  try {
    if (query) {
      // Search for anime
      const response = await fetch(
        `${JIKAN_CONFIG.BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=20`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch anime: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.data && Array.isArray(data.data)) {
        return data.data.map((anime: any, index: number) =>
          mapJikanToAnime(anime, index)
        )
      }

      return []
    } else {
      // Return popular anime when no query
      return await getPopularAnime()
    }
  } catch (error) {
    console.error('Error fetching anime:', error)
    throw error
  }
}

export const fetchMovieDetails = async (
  animeId: string
): Promise<MovieDetails> => {
  try {
    const response = await fetch(
      `${JIKAN_CONFIG.BASE_URL}/anime/${animeId}/full`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch anime details: ${response.statusText}`)
    }

    const data = await response.json()
    const anime = data.data

    if (!anime) {
      throw new Error('Anime not found')
    }

    // Extract release date
    const airedFrom = anime.aired?.from
      ? new Date(anime.aired.from).toISOString().split('T')[0]
      : '2024-01-01'

    // Map genres
    const genres =
      anime.genres?.map((g: any, idx: number) => ({
        id: g.mal_id || idx,
        name: g.name || '',
      })) || []

    // Map studios
    const productionCompanies =
      anime.studios?.map((studio: any, idx: number) => ({
        id: studio.mal_id || idx,
        logo_path: null,
        name: studio.name || '',
        origin_country: 'JP',
      })) || []

    // Map producers
    const producers =
      anime.producers?.map((producer: any, idx: number) => ({
        id: producer.mal_id || idx,
        logo_path: null,
        name: producer.name || '',
        origin_country: 'JP',
      })) || []

    // Combine studios and producers
    const allProductionCompanies = [...productionCompanies, ...producers]

    return {
      adult: false,
      backdrop_path:
        anime.images?.jpg?.large_image_url ||
        anime.images?.jpg?.image_url ||
        null,
      belongs_to_collection: null,
      budget: 0,
      genres,
      homepage: anime.url || null,
      id: anime.mal_id || 0,
      imdb_id: null,
      original_language: 'ja',
      original_title: anime.title_japanese || anime.title || '',
      overview: anime.synopsis || null,
      popularity: anime.popularity || 0,
      poster_path: anime.images?.jpg?.image_url || null,
      production_companies: allProductionCompanies,
      production_countries: [{ iso_3166_1: 'JP', name: 'Japan' }],
      release_date: airedFrom,
      revenue: 0,
      runtime: anime.duration
        ? parseInt(anime.duration.replace(/[^0-9]/g, '')) || null
        : null,
      spoken_languages: [
        { english_name: 'Japanese', iso_639_1: 'ja', name: 'Japanese' },
      ],
      status: anime.status || 'Unknown',
      tagline: null,
      title: anime.title || anime.title_english || '',
      video: false,
      vote_average: (anime.score || 0) * 2, // Convert 0-10 to 0-20 scale
      vote_count: anime.scored_by || 0,
      // Anime-specific fields (mapped from Jikan)
      director: null, // Jikan doesn't provide director in main response
      writer: null,
      actors: null,
      awards: null,
      boxOffice: null,
      production: anime.studios?.map((s: any) => s.name).join(', ') || null,
      website: anime.url || null,
      rated: anime.rating || null,
      dvd: null,
      language: 'Japanese',
      country: 'Japan',
      metascore: null,
      ratings: undefined,
      // Additional anime-specific fields we can add
      episodes: anime.episodes || null,
      type: anime.type || null,
      source: anime.source || null,
      aired: anime.aired?.string || null,
      season: anime.season || null,
      year: anime.year || null,
      broadcast: anime.broadcast?.string || null,
      // Additional Jikan API fields
      rank: anime.rank || null,
      favorites: anime.favorites || null,
      members: anime.members || null,
      trailer: anime.trailer
        ? {
            youtube_id: anime.trailer.youtube_id || null,
            url: anime.trailer.url || null,
            embed_url: anime.trailer.embed_url || null,
          }
        : null,
      relations: anime.relations || null,
      external: null, // Jikan API doesn't provide external links in main response
    }
  } catch (error) {
    console.error('Error fetching anime details:', error)
    throw error
  }
}
