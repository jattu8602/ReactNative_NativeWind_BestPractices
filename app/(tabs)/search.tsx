import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  View,
} from 'react-native'

import { icons } from '@/constants/icons'
import { images } from '@/constants/images'

import { fetchMovies } from '@/services/api'

import MovieDisplayCard from '@/components/MovieCard'
import SearchBar from '@/components/SearchBar'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const searchInputRef = useRef<TextInput>(null)

  const handleSearch = (text: string) => {
    setSearchQuery(text)
    setPage(1)
    setMovies([])
  }

  // Load movies function
  const loadMovies = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (!searchQuery.trim()) {
        setMovies([])
        setHasMore(false)
        return
      }

      try {
        if (pageNum === 1) {
          setLoading(true)
        } else {
          setLoadingMore(true)
        }
        setError(null)

        const result = await fetchMovies({ query: searchQuery, page: pageNum })

        if (append) {
          setMovies((prev) => [...prev, ...result.data])
        } else {
          setMovies(result.data)
        }
        setHasMore(result.hasMore)
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('An unknown error occurred')
        )
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [searchQuery]
  )

  // Load more when scrolling to end
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && searchQuery.trim()) {
      const nextPage = page + 1
      setPage(nextPage)
      loadMovies(nextPage, true)
    }
  }, [loadingMore, hasMore, searchQuery, page, loadMovies])

  // Auto-focus search input when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Small delay to ensure the screen is fully rendered
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)

      return () => clearTimeout(timer)
    }, [])
  )

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        loadMovies(1, false)
      } else {
        setMovies([])
        setHasMore(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, loadMovies])

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <FlatList
        className="px-5"
        data={movies}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => <MovieDisplayCard {...item} />}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: 'flex-start',
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View className="py-5">
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            <View className="my-5">
              <SearchBar
                ref={searchInputRef}
                placeholder="Search for an anime"
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}

            {error && (
              <Text className="text-red-500 px-5 my-3">
                Error: {error.message}
              </Text>
            )}

            {!loading &&
              !error &&
              searchQuery.trim() &&
              movies?.length! > 0 && (
                <Text className="text-xl text-white font-bold">
                  Search Results for{' '}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim()
                  ? 'No anime found'
                  : 'Start typing to search for anime'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

export default Search
