import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { icons } from '@/constants/icons'
import { fetchMovieDetails } from '@/services/api'
import useFetch from '@/services/usefetch'

interface MovieInfoProps {
  label: string
  value?: string | number | null
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-4">
    <Text className="text-light-300 font-normal text-sm mb-1">{label}</Text>
    <Text className="text-light-100 font-semibold text-base leading-5">
      {value || 'N/A'}
    </Text>
  </View>
)

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <View className="mt-6">
    <Text className="text-white font-bold text-xl mb-3 tracking-wide">
      {title}
    </Text>
    <View className="bg-dark-200/70 rounded-2xl p-4 shadow-md shadow-black/40">
      {children}
    </View>
  </View>
)

const Details = () => {
  const router = useRouter()
  const { id } = useLocalSearchParams()

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  )

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    )

  // Calculate IMDb rating from vote_average (stored as 0-20 scale, convert to 0-10)
  const imdbRating = movie?.vote_average
    ? (movie.vote_average / 2).toFixed(1)
    : null

  return (
    <View className="bg-primary flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Poster Header */}
        <View className="relative">
          <Image
            source={{
              uri:
                movie?.poster_path ||
                'https://placehold.co/600x400/1a1a1a/FFFFFF.png',
            }}
            className="w-full h-[520px]"
            resizeMode="cover"
          />

          {/* Overlay gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 200,
            }}
          />

          {/* Back button */}
          <TouchableOpacity
            className="absolute top-14 left-5 bg-black/60 rounded-full p-3"
            onPress={router.back}
          >
            <Image
              source={icons.arrow}
              className="size-5 rotate-180"
              tintColor="#fff"
            />
          </TouchableOpacity>

          {/* IMDb Rating Badge */}
          {imdbRating && (
            <View className="absolute bottom-6 left-5 bg-yellow-400/90 px-3 py-2 rounded-full shadow">
              <Text className="text-black font-bold text-base">
                ⭐ {imdbRating}/10 IMDb
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View className="px-5 pt-4">
          {/* Title */}
          <Text className="text-white text-3xl font-bold mb-2 tracking-wide">
            {movie?.title}
          </Text>

          {/* Sub Info */}
          <View className="flex-row flex-wrap items-center gap-x-3 mb-2">
            {movie?.release_date && (
              <Text className="text-light-300">
                {movie.release_date.split('-')[0]}
              </Text>
            )}
            {movie?.runtime && (
              <>
                <Text className="text-light-300">•</Text>
                <Text className="text-light-300">{movie.runtime}m</Text>
              </>
            )}
            {movie?.rated && (
              <>
                <Text className="text-light-300">•</Text>
                <View className="bg-accent/20 px-2 py-0.5 rounded">
                  <Text className="text-accent text-xs font-semibold">
                    {movie.rated}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Genre Tags */}
          {movie?.genres && movie.genres.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {movie.genres.map((genre, idx) => (
                <View
                  key={idx}
                  className="bg-accent/20 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-accent text-sm font-medium">
                    {genre.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Plot Section */}
          {movie?.overview && (
            <Section title="Plot">
              <Text className="text-light-100 text-base leading-6">
                {movie.overview}
              </Text>
            </Section>
          )}

          {/* Cast & Crew */}
          {(movie?.director || movie?.writer || movie?.actors) && (
            <Section title="Cast & Crew">
              {movie.director && (
                <MovieInfo label="Director" value={movie.director} />
              )}
              {movie.writer && (
                <MovieInfo label="Writer" value={movie.writer} />
              )}
              {movie.actors && (
                <MovieInfo label="Actors" value={movie.actors} />
              )}
            </Section>
          )}

          {/* Technical Info */}
          {(movie?.language || movie?.country || movie?.dvd) && (
            <Section title="Technical Info">
              {movie.language && (
                <MovieInfo label="Language" value={movie.language} />
              )}
              {movie.country && (
                <MovieInfo label="Country" value={movie.country} />
              )}
              {movie.dvd && <MovieInfo label="DVD Release" value={movie.dvd} />}
            </Section>
          )}

          {/* Awards */}
          {movie?.awards && (
            <Section title="Awards">
              <Text className="text-light-100 text-base leading-6 italic">
                🏆 {movie.awards}
              </Text>
            </Section>
          )}

          {/* Box Office */}
          {movie?.boxOffice && (
            <Section title="Box Office">
              <Text className="text-green-400 font-bold text-2xl">
                {movie.boxOffice}
              </Text>
            </Section>
          )}

          {/* Production */}
          {movie?.production && (
            <Section title="Production">
              <Text className="text-light-100 text-base">
                {movie.production}
              </Text>
            </Section>
          )}

          {/* Website */}
          {movie?.website && (
            <Section title="Official Website">
              <TouchableOpacity onPress={() => Linking.openURL(movie.website!)}>
                <Text className="text-accent underline text-base font-semibold">
                  {movie.website}
                </Text>
              </TouchableOpacity>
            </Section>
          )}

          {/* Ratings Section */}
          {movie?.ratings && movie.ratings.length > 0 && (
            <Section title="All Ratings">
              {movie.ratings.map((rating, idx) => (
                <View
                  key={idx}
                  className="flex-row justify-between items-center py-2 border-b border-dark-300 last:border-0"
                >
                  <Text className="text-light-200 text-sm">
                    {rating.Source}
                  </Text>
                  <Text className="text-white font-bold text-sm">
                    {rating.Value}
                  </Text>
                </View>
              ))}
            </Section>
          )}
        </View>
      </ScrollView>

      {/* Back Button */}
      <TouchableOpacity
        className="absolute bottom-5 left-5 right-5 bg-accent rounded-lg py-4 flex flex-row items-center justify-center z-50 shadow-lg"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-2 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Details
