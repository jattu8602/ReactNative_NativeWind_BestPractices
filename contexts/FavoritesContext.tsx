import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react'

import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = '@anime_app_favorites_v1'

type FavoritesContextValue = {
  favorites: Movie[]
  isFavorite: (id: number) => boolean
  toggleFavorite: (anime: Movie) => void
  hydrated: boolean
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined)

const normalizeMovie = (anime: Movie): Movie => ({
  id: anime.id,
  title: anime.title,
  adult: Boolean(anime.adult),
  backdrop_path: anime.backdrop_path ?? '',
  genre_ids: Array.isArray(anime.genre_ids) ? anime.genre_ids : [],
  original_language: anime.original_language ?? 'ja',
  original_title: anime.original_title ?? anime.title ?? '',
  overview: anime.overview ?? '',
  popularity: Number.isFinite(anime.popularity) ? anime.popularity : 0,
  poster_path: anime.poster_path ?? '',
  release_date: anime.release_date ?? '',
  video: Boolean(anime.video),
  vote_average: Number.isFinite(anime.vote_average) ? anime.vote_average : 0,
  vote_count: Number.isFinite(anime.vote_count) ? anime.vote_count : 0,
})

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavoritesState] = useState<Movie[]>([])
  const [hydrated, setHydrated] = useState(false)

  const persistFavorites = useCallback(async (next: Movie[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (error) {
      console.warn('Failed to persist favorites', error)
    }
  }, [])

  useEffect(() => {
    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as Movie[]
          if (Array.isArray(parsed)) {
            const normalized = parsed.map(normalizeMovie)
            setFavoritesState((prev) => {
              if (!prev.length) {
                persistFavorites(normalized)
                return normalized
              }

              const mergedMap = new Map<number, Movie>()
              normalized.forEach((item) => mergedMap.set(item.id, item))
              prev.forEach((item) => mergedMap.set(item.id, item))
              const combined = Array.from(mergedMap.values())
              persistFavorites(combined)
              return combined
            })
          }
        }
      } catch (error) {
        console.warn('Failed to load favorites from storage', error)
      } finally {
        setHydrated(true)
      }
    }

    hydrate()
  }, [persistFavorites])

  const isFavorite = useCallback(
    (id: number) => favorites.some((anime) => anime.id === id),
    [favorites]
  )

  const toggleFavorite = useCallback(
    (anime: Movie) => {
      setFavoritesState((prev) => {
        const exists = prev.some((item) => item.id === anime.id)
        const next = exists
          ? prev.filter((item) => item.id !== anime.id)
          : [normalizeMovie(anime), ...prev]
        persistFavorites(next)
        return next
      })
    },
    [persistFavorites]
  )

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        hydrated,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = (): FavoritesContextValue => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
