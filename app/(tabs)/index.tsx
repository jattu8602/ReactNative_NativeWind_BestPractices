import { useMemo } from 'react'

import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from 'react-native'

import { fetchMovies } from '@/services/api'
import useFetch from '@/services/usefetch'

import { icons } from '@/constants/icons'
import { images } from '@/constants/images'

import MovieCard from '@/components/MovieCard'
import SearchBar from '@/components/SearchBar'

const Index = () => {
  const router = useRouter()

  const {
    data: moviesData,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(async () => {
    const result = await fetchMovies({ query: '' })
    return result.data
  })

  const movies = moviesData || []

  const sections = useMemo(() => {
    if (!movies.length) {
      return []
    }

    const parseReleaseDate = (value?: string) => {
      if (!value) return 0
      const timestamp = new Date(value).getTime()
      return Number.isFinite(timestamp) ? timestamp : 0
    }

    const uniqueById = (list: Movie[]) => {
      const map = new Map<number, Movie>()
      list.forEach((movie) => {
        if (!map.has(movie.id)) {
          map.set(movie.id, movie)
        }
      })
      return Array.from(map.values())
    }

    const byPopularity = uniqueById(
      [...movies].sort((a, b) => b.popularity - a.popularity)
    )
    const byReleaseDate = uniqueById(
      [...movies].sort(
        (a, b) => parseReleaseDate(b.release_date) - parseReleaseDate(a.release_date)
      )
    )
    const byScore = uniqueById(
      [...movies].sort((a, b) => b.vote_average - a.vote_average)
    )

    const pickGenre = (genreId: number) =>
      uniqueById(
        movies.filter((movie) => (movie.genre_ids ?? []).includes(genreId))
      )

    const clampToSection = (list: Movie[]) => {
      const fallback = list.length ? list : byPopularity
      return fallback.slice(0, 12)
    }

    return [
      { key: 'popular', title: 'Popular Anime', data: clampToSection(byPopularity) },
      {
        key: 'recent',
        title: 'Recently Added',
        data: clampToSection(byReleaseDate),
      },
      {
        key: 'recommendations',
        title: 'You May Like',
        data: clampToSection(
          uniqueById([
            ...byScore.slice(3, 18),
            ...byPopularity.slice(8, 20),
          ])
        ),
      },
      {
        key: 'action',
        title: 'Action Spotlight',
        data: clampToSection(pickGenre(1)),
      },
      {
        key: 'fantasy',
        title: 'Fantasy Worlds',
        data: clampToSection(pickGenre(10)),
      },
      {
        key: 'romance',
        title: 'Romance Stories',
        data: clampToSection(pickGenre(22)),
      },
    ]
  }, [movies])

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: '100%', paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

          {moviesLoading ? (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              className="mt-10 self-center"
            />
          ) : moviesError ? (
            <Text>Error: {moviesError?.message}</Text>
          ) : (
            <View className="flex-1 mt-5">
              <SearchBar
                onPress={() => {
                  router.push('/search')
                }}
                placeholder="Search for an anime"
              />

              {!sections.length ? (
                <Text className="text-white text-base font-medium mt-8">
                  No anime to display right now. Try searching for something else.
                </Text>
              ) : (
                <View className="mt-10 space-y-10">
                  {sections.map(({ key, title, data }) => (
                    <View key={key} className="space-y-4">
                      <Text className="text-lg text-white font-bold">{title}</Text>

                      <FlatList
                        horizontal
                        data={data}
                        keyExtractor={(item) => item.id.toString()}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 24 }}
                        renderItem={({ item, index }) => (
                          <MovieCard
                            {...item}
                            containerClassName={`w-36 ${
                              index !== data.length - 1 ? 'mr-4' : ''
                            }`}
                            imageClassName="w-full h-52 rounded-xl"
                          />
                        )}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
      </ScrollView>
    </View>
  )
}

export default Index
