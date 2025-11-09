interface Movie {
  id: number;
  title: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TrendingMovie {
  searchTerm: string;
  movie_id: number;
  title: string;
  count: number;
  poster_url: string;
}

interface MovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  // OMDb-specific fields
  director?: string | null;
  writer?: string | null;
  actors?: string | null;
  awards?: string | null;
  boxOffice?: string | null;
  production?: string | null;
  website?: string | null;
  rated?: string | null;
  dvd?: string | null;
  language?: string | null;
  country?: string | null;
  metascore?: string | null;
  ratings?: Array<{
    Source: string;
    Value: string;
  }>;
  // Anime-specific fields (from Jikan API)
  episodes?: number | null;
  type?: string | null; // TV, Movie, OVA, etc.
  source?: string | null; // Manga, Original, etc.
  aired?: string | null; // Aired date string
  season?: string | null; // spring, summer, fall, winter
  year?: number | null;
  broadcast?: string | null; // Broadcast schedule
  // Additional Jikan API fields
  rank?: number | null;
  favorites?: number | null;
  members?: number | null;
  trailer?: {
    youtube_id?: string | null;
    url?: string | null;
    embed_url?: string | null;
  } | null;
  relations?: Array<{
    relation: string;
    entry: Array<{
      mal_id: number;
      type: string;
      name: string;
      url: string;
      images?: {
        jpg?: {
          image_url?: string;
          small_image_url?: string;
          large_image_url?: string;
        };
        webp?: {
          image_url?: string;
          small_image_url?: string;
          large_image_url?: string;
        };
      };
    }>;
  }> | null;
  external?: Array<{
    name: string;
    url: string;
  }> | null;
}

interface TrendingCardProps {
  movie: TrendingMovie;
  index: number;
}
