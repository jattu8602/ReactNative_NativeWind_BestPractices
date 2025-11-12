import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Linking,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'

import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { getGenreConfig } from '@/data/genres'
import { fetchMovieDetails } from '@/services/api'
import { useFavorites } from '@/contexts/FavoritesContext'
import useFetch from '@/services/usefetch'

// Component to fetch and display related item image
const RelatedItemImage = ({ type, malId }: { type: string; malId: number }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (type === 'anime' || type === 'manga') {
      fetch(`https://api.jikan.moe/v4/${type}/${malId}`)
        .then((res) => res.json())
        .then((data) => {
          const imgUrl =
            data.data?.images?.jpg?.image_url ||
            data.data?.images?.jpg?.small_image_url ||
            null
          setImageUrl(imgUrl)
        })
        .catch(() => {
          // Keep null for placeholder
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [type, malId])

  if (loading) {
    return (
      <View
        className="rounded-lg mr-3 items-center justify-center"
        style={{ width: 48, height: 64, backgroundColor: '#2a2a3a' }}
      >
        <ActivityIndicator size="small" color="#9CA4AB" />
      </View>
    )
  }

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: 48, height: 64 }}
        className="rounded-lg mr-3"
        resizeMode="cover"
      />
    )
  }

  // Placeholder
  return (
    <View
      className="rounded-lg mr-3 items-center justify-center"
      style={{ width: 48, height: 64, backgroundColor: '#2a2a3a' }}
    >
      <Text className="text-accentText text-xs">📺</Text>
    </View>
  )
}

const Details = () => {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { width } = useWindowDimensions()
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [imageHeight, setImageHeight] = useState<number | null>(null)

  const { isFavorite, toggleFavorite } = useFavorites()

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  )

  // Calculate image height based on aspect ratio
  useEffect(() => {
    if (movie) {
      const imageUri =
        movie?.backdrop_path ||
        movie?.poster_path ||
        'https://placehold.co/600x400/1a1a1a/FFFFFF.png'

      Image.getSize(
        imageUri,
        (imgWidth, imgHeight) => {
          // Calculate height based on screen width and image aspect ratio
          const aspectRatio = imgHeight / imgWidth
          const calculatedHeight = width * aspectRatio
          setImageHeight(calculatedHeight)
        },
        () => {
          // Fallback to 16:9 aspect ratio if image fails to load
          setImageHeight(width * (9 / 16))
        }
      )
    }
  }, [movie, width])

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </SafeAreaView>
    )

  // Calculate MAL score from vote_average (stored as 0-20 scale, convert to 0-10)
  const malScore = movie?.vote_average
    ? (movie.vote_average / 2).toFixed(2)
    : null

  // Format numbers for display
  const formatNumber = (num: number | null | undefined): string => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`
    return num.toString()
  }

  // Extract YouTube video ID from embed URL
  const getYouTubeVideoId = (
    embedUrl: string | null | undefined
  ): string | null => {
    if (!embedUrl) return null
    // Try multiple patterns to extract video ID
    const patterns = [
      /[?&]v=([^&]+)/,
      /embed\/([^?&]+)/,
      /youtu\.be\/([^?&]+)/,
      /youtube\.com\/watch\?v=([^&]+)/,
    ]
    for (const pattern of patterns) {
      const match = embedUrl.match(pattern)
      if (match) return match[1]
    }
    return null
  }

    const youtubeId =
      movie?.trailer?.youtube_id ||
      getYouTubeVideoId(movie?.trailer?.embed_url || null)

    // Build proper YouTube embed URL with all required parameters
    const getYouTubeEmbedUrl = (videoId: string | null): string | null => {
      if (!videoId) return null
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(
        'https://localhost'
      )}`
    }

    const youtubeEmbedUrl = getYouTubeEmbedUrl(youtubeId)

    const liked = movie ? isFavorite(movie.id) : false
    const movieForSaving = movie
      ? {
          id: movie.id,
          title: movie.title ?? '',
          adult: movie.adult ?? false,
          backdrop_path:
            movie.backdrop_path ??
            movie.poster_path ??
            'https://placehold.co/600x400/1a1a1a/FFFFFF.png',
          genre_ids: movie.genres?.map((genre) => genre.id) ?? [],
          original_language: movie.original_language ?? 'ja',
          original_title: movie.original_title ?? movie.title ?? '',
          overview: movie.overview ?? '',
          popularity: movie.popularity ?? 0,
          poster_path:
            movie.poster_path ??
            movie.backdrop_path ??
            'https://placehold.co/600x400/1a1a1a/FFFFFF.png',
          release_date: movie.release_date ?? '',
          video: movie.video ?? false,
          vote_average: movie.vote_average ?? 0,
          vote_count: movie.vote_count ?? 0,
        } as Movie
      : null

  return (
    <View className="bg-primary flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Header Image with Overlay Content */}
        <View
          className="relative"
          style={{
            height: imageHeight || width * (9 / 16), // Fallback to 16:9 if not loaded yet
          }}
        >
          <Image
            source={{
              uri:
                movie?.backdrop_path ||
                movie?.poster_path ||
                'https://placehold.co/600x400/1a1a1a/FFFFFF.png',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
            }}
          />
          {/* TV Badge */}
          {movie?.type && (
            <View className="absolute top-14 right-5 bg-white/90 px-3 py-1 rounded z-10">
              <Text className="text-black text-xs font-bold">{movie.type}</Text>
            </View>
          )}

          {/* Like Button */}
          <TouchableOpacity
            className="absolute -bottom-10 right-6 z-20 items-center"
            onPress={() => {
              if (movieForSaving) {
                toggleFavorite(movieForSaving)
              }
            }}
            activeOpacity={0.85}
            disabled={!movieForSaving}
            accessibilityRole="button"
            accessibilityLabel={liked ? 'Remove from liked' : 'Add to liked'}
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center bg-white/95 border border-black/5"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 6 },
                elevation: 10,
              }}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={30}
                color={liked ? '#ef4444' : '#111827'}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View className="px-5 pt-12">
          {/* Title and Info Overlay */}
          <View className="mb-6">
            <Text className="text-white text-4xl font-bold mb-2 tracking-wide">
              {movie?.title}
            </Text>
            {movie?.original_title && movie.original_title !== movie?.title && (
              <Text className="text-white text-lg mb-4">
                {movie.original_title}
              </Text>
            )}

            {/* Statistics Badges - Two Rows */}
            <View className="flex-row flex-wrap gap-2 mb-2">
              {malScore && (
                <View className="bg-blue-500/90 px-4 py-2.5 rounded-lg">
                  <Text className="text-white font-bold text-sm">
                    {malScore} | {formatNumber(movie?.vote_count)} Ratings
                  </Text>
                </View>
              )}
              {movie?.favorites && (
                <View className="bg-pink-500/90 px-4 py-2.5 rounded-lg">
                  <Text className="text-white font-bold text-sm">
                    {formatNumber(movie.favorites)} Favorites
                  </Text>
                </View>
              )}
              {movie?.rank && (
                <View className="bg-yellow-500/90 px-4 py-2.5 rounded-lg">
                  <Text className="text-white font-bold text-sm">
                    Rank #{movie.rank}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row flex-wrap gap-2">
              {movie?.popularity && (
                <View className="bg-teal-500/90 px-4 py-2.5 rounded-lg">
                  <Text className="text-white font-bold text-sm">
                    Popularity #{movie.popularity}
                  </Text>
                </View>
              )}
              {movie?.members && (
                <View className="bg-gray-600/90 px-4 py-2.5 rounded-lg">
                  <Text className="text-white font-bold text-sm">
                    {formatNumber(movie.members)} Watch Lists
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Synopsis Section */}
          {movie?.overview && (
            <View className="mb-6 ">
              <Text className="text-white text-lg font-bold mb-3">
                Synopsis
              </Text>
              <Text className="text-white leading-6">{movie.overview}</Text>
            </View>
          )}

          {/* Info Section */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-3">Info</Text>
            <View className="bg-dark-200/70 rounded-2xl py-4">
              {movie?.status && (
                <View className="flex-row items-center py-2 border-b border-gray-700/50">
                  <View className="bg-blue-500/90 px-4 py-2 rounded-lg mr-3">
                    <Text className="text-white text-sm font-bold">
                      Status:
                    </Text>
                  </View>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.status}
                  </Text>
                </View>
              )}
              {movie?.source && (
                <View className="flex-row items-center py-2 border-b border-gray-700/50">
                  <View className="bg-purple-500/90 px-4 py-2 rounded-lg mr-3">
                    <Text className="text-white text-sm font-bold">
                      Source:
                    </Text>
                  </View>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.source}
                  </Text>
                </View>
              )}
              {movie?.episodes && (
                <View className="flex-row items-center py-2 border-b border-gray-700/50">
                  <View className="bg-green-500/90 px-4 py-2 rounded-lg mr-3">
                    <Text className="text-white text-sm font-bold">
                      Episodes:
                    </Text>
                  </View>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.episodes}
                  </Text>
                </View>
              )}
              {movie?.runtime && (
                <View className="flex-row items-center py-2 border-b border-gray-700/50">
                  <View className="bg-orange-500/90 px-4 py-2 rounded-lg mr-3">
                    <Text className="text-white text-sm font-bold">
                      Duration:
                    </Text>
                  </View>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.runtime} min per ep
                  </Text>
                </View>
              )}
              {movie?.rated && (
                <View className="flex-row items-center py-2 border-b border-gray-700/50">
                  <View className="bg-red-500/90 px-4 py-2 rounded-lg mr-3">
                    <Text className="text-white text-sm font-bold">
                      Rating:
                    </Text>
                  </View>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.rated}
                  </Text>
                </View>
              )}
              {movie?.season && movie?.year && (
                <View className="flex-row items-center py-2 border-b border-gray-700/50">
                  <View className="bg-cyan-500/90 px-4 py-2 rounded-lg mr-3">
                    <Text className="text-white text-sm font-bold">
                      Season:
                    </Text>
                  </View>
                  <Text className="text-white text-sm font-semibold flex-1 capitalize">
                    {movie.season} {movie.year}
                  </Text>
                </View>
              )}
              {movie?.aired && (
                <View className="flex-row items-center py-2 border-b border-gray-700/50">
                  <View className="bg-pink-500/90 px-4 py-2 rounded-lg mr-3">
                    <Text className="text-white text-sm font-bold">Aired:</Text>
                  </View>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.aired}
                  </Text>
                </View>
              )}
              {movie?.broadcast && (
                <View className="flex-row items-center py-2">
                  <View className="bg-yellow-500/90 px-4 py-2 rounded-lg mr-3">
                    <Text className="text-white text-sm font-bold">
                      Broadcast:
                    </Text>
                  </View>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.broadcast}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Genre Tags */}
          {movie?.genres && movie.genres.length > 0 && (
            <View className="mb-6">
              <Text className="text-white text-lg font-bold mb-3">Genre</Text>
              <View className="flex-row flex-wrap gap-2">
                {movie.genres.map((genre, idx) => {
                  const genreConfig = getGenreConfig(genre.name)
                  return (
                    <View
                      key={idx}
                      className="px-4 py-2.5 rounded-lg"
                      style={{ backgroundColor: genreConfig.color }}
                    >
                      <Text className="text-white text-sm font-bold">
                        {genreConfig.emoji} {genre.name}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>
          )}

          {/* External Links */}
          {movie?.website && (
            <View className="mb-6">
              <Text className="text-white text-lg font-bold mb-3">
                External
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  className="bg-blue-500/80 px-4 py-2 rounded-lg"
                  onPress={() => Linking.openURL(movie.website!)}
                >
                  <Text className="text-white text-sm font-semibold">
                    Official Site
                  </Text>
                </TouchableOpacity>
                {movie?.homepage && (
                  <TouchableOpacity
                    className="bg-blue-500/80 px-4 py-2 rounded-lg"
                    onPress={() => Linking.openURL(movie.homepage!)}
                  >
                    <Text className="text-white text-sm font-semibold">
                      MyAnimeList
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* YouTube Video Embed */}
          {youtubeId && (
            <View className="mb-6">
              <Text className="text-white text-lg font-bold mb-3">Trailer</Text>
              <View className="bg-dark-200/70 rounded-2xl overflow-hidden">
                {/* Video Thumbnail with Play Button */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setShowVideoModal(true)}
                  className="relative"
                >
                  {/* YouTube Thumbnail */}
                  <Image
                    source={{
                      uri: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
                    }}
                    className="w-full h-[220px]"
                    resizeMode="cover"
                    onError={() => {
                      // Fallback to lower quality thumbnail
                    }}
                  />

                  {/* Play Button Overlay */}
                  <View className="absolute inset-0 items-center justify-center">
                    <View
                      className="bg-red-600 rounded-full w-20 h-20 items-center justify-center"
                      style={{
                        shadowColor: 'transparent',
                        elevation: 0,
                      }}
                    >
                      <View
                        style={{
                          width: 0,
                          height: 0,
                          backgroundColor: 'transparent',
                          borderStyle: 'solid',
                          borderLeftWidth: 16,
                          borderRightWidth: 0,
                          borderTopWidth: 10,
                          borderBottomWidth: 10,
                          borderLeftColor: '#fff',
                          borderTopColor: 'transparent',
                          borderBottomColor: 'transparent',
                          borderRightColor: 'transparent',
                          marginLeft: 4,
                        }}
                      />
                    </View>
                  </View>

                  {/* YouTube Logo Badge */}
                  <View className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded">
                    <Text className="text-white text-xs font-bold">
                      YouTube
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Related Content */}
          {movie?.relations && movie.relations.length > 0 && (
            <View className="mb-6">
              <Text className="text-white text-lg font-bold mb-3">Related</Text>
              <View className="gap-3">
                {movie.relations.map((relation, relationIdx) =>
                  relation.entry.map((entry, entryIdx) => {
                    const isLastRelation =
                      relationIdx === (movie.relations?.length || 0) - 1
                    const isLastEntry = entryIdx === relation.entry.length - 1
                    const isLastItem = isLastRelation && isLastEntry

                    return (
                      <View key={`${relationIdx}-${entryIdx}`}>
                        <TouchableOpacity
                          className="bg-dark-200/70 rounded-xl p-4"
                          onPress={() => {
                            if (entry.type === 'anime') {
                              router.push(`/movie/${entry.mal_id}`)
                            } else {
                              Linking.openURL(entry.url)
                            }
                          }}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1">
                              <RelatedItemImage
                                type={entry.type}
                                malId={entry.mal_id}
                              />
                              <View className="flex-1">
                                <Text className="text-white font-semibold text-base mb-1">
                                  {entry.name}
                                </Text>
                                <Text className="text-white text-xs">
                                  {relation.relation} ({entry.type})
                                </Text>
                              </View>
                            </View>
                            <Image
                              source={icons.arrow}
                              className="size-4"
                              tintColor="#fff"
                            />
                          </View>
                        </TouchableOpacity>
                        {!isLastItem && (
                          <View className="h-px bg-white/10 mt-3" />
                        )}
                      </View>
                    )
                  })
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Back Button */}
      <TouchableOpacity
        className="absolute bottom-1 self-center rounded-full px-6 py-3.5 flex flex-row items-center justify-center z-50 overflow-hidden"
        onPress={router.back}
        activeOpacity={0.2}
      >
        <ImageBackground
          source={images.highlight}
          className="flex flex-row items-center justify-center rounded-full px-5 py-3"
          style={{ minWidth: 120 }}
        >
          <Image
            source={icons.arrow}
            className="size-5 mr-2 rotate-180"
            tintColor="#151312"
          />
          <Text className="text-secondary font-semibold text-base">
            Go Back
          </Text>
        </ImageBackground>
      </TouchableOpacity>

      {/* Video Modal */}
      {youtubeId && (
        <Modal
          visible={showVideoModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowVideoModal(false)}
        >
          <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between px-5 py-4 bg-black/90">
                <Text className="text-white text-lg font-bold">Trailer</Text>
                <TouchableOpacity
                  onPress={() => setShowVideoModal(false)}
                  className="bg-white/20 rounded-full w-10 h-10 items-center justify-center"
                >
                  <Text className="text-white text-lg font-bold">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Video Player */}
              <View className="flex-1 justify-center bg-black">
                {youtubeEmbedUrl ? (
                  <WebView
                    source={{ uri: youtubeEmbedUrl }}
                    style={{ flex: 1, backgroundColor: '#000' }}
                    allowsFullscreenVideo={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
                    onError={(syntheticEvent) => {
                      const { nativeEvent } = syntheticEvent
                      console.warn('WebView error: ', nativeEvent)
                    }}
                    onHttpError={(syntheticEvent) => {
                      const { nativeEvent } = syntheticEvent
                      console.warn('HTTP error: ', nativeEvent)
                    }}
                    renderLoading={() => (
                      <View className="absolute inset-0 items-center justify-center ">
                        <ActivityIndicator size="large" color="#fff" />
                      </View>
                    )}
                  />
                ) : (
                  <View className="flex-1 items-center justify-center p-5">
                    <Text className="text-white text-center mb-4">
                      Unable to load video player
                    </Text>
                    <TouchableOpacity
                      className="bg-red-600 px-6 py-3 rounded-lg"
                      onPress={() => {
                        setShowVideoModal(false)
                        Linking.openURL(
                          `https://www.youtube.com/watch?v=${youtubeId}`
                        )
                      }}
                    >
                      <Text className="text-white font-semibold">
                        Watch on YouTube
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </View>
  )
}

export default Details
