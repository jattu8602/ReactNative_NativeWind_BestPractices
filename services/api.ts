export const OMDB_CONFIG = {
  BASE_URL: 'https://www.omdbapi.com',
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
}

// Helper function to map OMDb search result to Movie interface
const mapOMDbToMovie = (omdbMovie: any, index: number): Movie => {
  // Extract year from Year field (format: "2023" or "2023–2024")
  const year = omdbMovie.Year ? omdbMovie.Year.split('–')[0] : '2024'

  // Convert IMDb ID (tt1234567) to numeric ID for compatibility
  const numericId = omdbMovie.imdbID
    ? parseInt(omdbMovie.imdbID.replace('tt', ''), 10) || index + 1000
    : index + 1000

  return {
    id: numericId,
    title: omdbMovie.Title || '',
    adult: false,
    backdrop_path: omdbMovie.Poster || '',
    genre_ids: [],
    original_language: 'en',
    original_title: omdbMovie.Title || '',
    overview: omdbMovie.Plot || '',
    popularity: parseFloat(omdbMovie.imdbRating || '0'),
    poster_path: omdbMovie.Poster || '',
    release_date: `${year}-01-01`,
    video: false,
    vote_average: parseFloat(omdbMovie.imdbRating || '0') * 2, // Convert 0-10 to 0-20 scale
    vote_count: parseInt(omdbMovie.imdbVotes?.replace(/,/g, '') || '0', 10),
  }
}

// Helper function to get popular movies (using search with common terms)
const getPopularMovies = async (): Promise<Movie[]> => {
  const popularTerms = [
    'action',
    'comedy',
    'drama',
    'thriller',
    'horror',
    'sci-fi',
  ]
  const allMovies: Movie[] = []

  // Fetch movies for each popular term
  for (let i = 0; i < 2; i++) {
    const term = popularTerms[Math.floor(Math.random() * popularTerms.length)]
    try {
      const response = await fetch(
        `${OMDB_CONFIG.BASE_URL}/?apikey=${
          OMDB_CONFIG.API_KEY
        }&s=${encodeURIComponent(term)}&type=movie&page=1`
      )
      const data = await response.json()

      if (data.Response === 'True' && data.Search) {
        // Fetch details for each movie to get more info
        const moviesWithDetails = await Promise.all(
          data.Search.slice(0, 5).map(async (movie: any, idx: number) => {
            try {
              const detailResponse = await fetch(
                `${OMDB_CONFIG.BASE_URL}/?apikey=${OMDB_CONFIG.API_KEY}&i=${movie.imdbID}`
              )
              const detailData = await detailResponse.json()
              return mapOMDbToMovie(detailData, allMovies.length + idx)
            } catch {
              return mapOMDbToMovie(movie, allMovies.length + idx)
            }
          })
        )
        allMovies.push(...moviesWithDetails)
      }
    } catch (error) {
      console.error(`Error fetching popular movies for term ${term}:`, error)
    }
  }

  return allMovies.slice(0, 20) // Return up to 20 movies
}

export const fetchMovies = async ({
  query,
}: {
  query: string
}): Promise<Movie[]> => {
  if (!OMDB_CONFIG.API_KEY) {
    throw new Error(
      'OMDb API key is not configured. Please set EXPO_PUBLIC_MOVIE_API_KEY in your .env file'
    )
  }

  try {
    if (query) {
      // Search for movies
      const response = await fetch(
        `${OMDB_CONFIG.BASE_URL}/?apikey=${
          OMDB_CONFIG.API_KEY
        }&s=${encodeURIComponent(query)}&type=movie&page=1`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.Response === 'False') {
        return []
      }

      // Fetch details for each movie to get complete information
      const moviesWithDetails = await Promise.all(
        data.Search.map(async (movie: any, index: number) => {
          try {
            const detailResponse = await fetch(
              `${OMDB_CONFIG.BASE_URL}/?apikey=${OMDB_CONFIG.API_KEY}&i=${movie.imdbID}`
            )
            const detailData = await detailResponse.json()
            return mapOMDbToMovie(detailData, index)
          } catch {
            // Fallback to basic movie data if detail fetch fails
            return mapOMDbToMovie(movie, index)
          }
        })
      )

      return moviesWithDetails
    } else {
      // Return popular movies when no query
      return await getPopularMovies()
    }
  } catch (error) {
    console.error('Error fetching movies:', error)
    throw error
  }
}

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  if (!OMDB_CONFIG.API_KEY) {
    throw new Error(
      'OMDb API key is not configured. Please set EXPO_PUBLIC_MOVIE_API_KEY in your .env file'
    )
  }

  try {
    // OMDb uses imdbID format, but we might receive numeric ID
    // Try both formats
    const imdbId = movieId.startsWith('tt')
      ? movieId
      : `tt${movieId.padStart(7, '0')}`

    const response = await fetch(
      `${OMDB_CONFIG.BASE_URL}/?apikey=${OMDB_CONFIG.API_KEY}&i=${imdbId}&plot=full`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch movie details: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.Response === 'False') {
      throw new Error(data.Error || 'Movie not found')
    }

    // Map OMDb response to MovieDetails interface
    const year = data.Year ? data.Year.split('–')[0] : '2024'
    const genres = data.Genre
      ? data.Genre.split(', ').map((g: string, idx: number) => ({
          id: idx,
          name: g.trim(),
        }))
      : []

    // Parse release date - OMDb provides "Released" field (e.g., "25 Dec 2009")
    let releaseDate = `${year}-01-01`
    if (data.Released && data.Released !== 'N/A') {
      try {
        const date = new Date(data.Released)
        if (!isNaN(date.getTime())) {
          releaseDate = date.toISOString().split('T')[0]
        }
      } catch {
        // Keep default if parsing fails
      }
    }

    return {
      adult: false,
      backdrop_path: data.Poster || null,
      belongs_to_collection: null,
      budget: 0,
      genres,
      homepage: data.Website && data.Website !== 'N/A' ? data.Website : null,
      id: parseInt(data.imdbID?.replace('tt', '') || '0', 10),
      imdb_id: data.imdbID || null,
      original_language: data.Language?.split(',')[0]?.trim() || 'en',
      original_title: data.Title || '',
      overview: data.Plot && data.Plot !== 'N/A' ? data.Plot : null,
      popularity: parseFloat(data.imdbRating || '0'),
      poster_path: data.Poster && data.Poster !== 'N/A' ? data.Poster : null,
      production_companies:
        data.Production && data.Production !== 'N/A'
          ? data.Production.split(', ').map((name: string, idx: number) => ({
              id: idx,
              logo_path: null,
              name: name.trim(),
              origin_country: data.Country?.split(',')[0]?.trim() || '',
            }))
          : [],
      production_countries:
        data.Country && data.Country !== 'N/A'
          ? data.Country.split(', ').map((name: string) => ({
              iso_3166_1: '',
              name: name.trim(),
            }))
          : [],
      release_date: releaseDate,
      revenue: 0,
      runtime:
        data.Runtime && data.Runtime !== 'N/A'
          ? parseInt(data.Runtime.replace(' min', ''))
          : null,
      spoken_languages:
        data.Language && data.Language !== 'N/A'
          ? data.Language.split(', ').map((name: string) => ({
              english_name: name.trim(),
              iso_639_1: '',
              name: name.trim(),
            }))
          : [],
      status: 'Released',
      tagline: null,
      title: data.Title || '',
      video: false,
      vote_average: parseFloat(data.imdbRating || '0') * 2, // Convert 0-10 to 0-20 scale
      vote_count: parseInt(data.imdbVotes?.replace(/,/g, '') || '0', 10),
      // OMDb-specific fields
      director: data.Director && data.Director !== 'N/A' ? data.Director : null,
      writer: data.Writer && data.Writer !== 'N/A' ? data.Writer : null,
      actors: data.Actors && data.Actors !== 'N/A' ? data.Actors : null,
      awards: data.Awards && data.Awards !== 'N/A' ? data.Awards : null,
      boxOffice:
        data.BoxOffice && data.BoxOffice !== 'N/A' ? data.BoxOffice : null,
      production:
        data.Production && data.Production !== 'N/A' ? data.Production : null,
      website: data.Website && data.Website !== 'N/A' ? data.Website : null,
      rated: data.Rated && data.Rated !== 'N/A' ? data.Rated : null,
      dvd: data.DVD && data.DVD !== 'N/A' ? data.DVD : null,
      language: data.Language && data.Language !== 'N/A' ? data.Language : null,
      country: data.Country && data.Country !== 'N/A' ? data.Country : null,
      metascore:
        data.Metascore && data.Metascore !== 'N/A' ? data.Metascore : null,
      ratings:
        data.Ratings && Array.isArray(data.Ratings) ? data.Ratings : undefined,
    }
  } catch (error) {
    console.error('Error fetching movie details:', error)
    throw error
  }
}
