import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Image,
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
import { fetchMovieDetails } from '@/services/api'
import useFetch from '@/services/usefetch'

const Details = () => {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { height, width } = useWindowDimensions()
  const [showVideoModal, setShowVideoModal] = useState(false)

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

  return (
    <View className="bg-primary flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Header Image with Overlay Content */}
        <View className="relative" style={{ height: height * 0.5 }}>
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

          {/* Back Button */}
          <TouchableOpacity
            className="absolute top-14 left-5 bg-black/60 rounded-full p-3 z-10"
            onPress={router.back}
          >
            <Image
              source={icons.arrow}
              className="size-5 rotate-180"
              tintColor="#fff"
            />
          </TouchableOpacity>

          {/* TV Badge */}
          {movie?.type && (
            <View className="absolute top-14 right-5 bg-white/90 px-3 py-1 rounded z-10">
              <Text className="text-black text-xs font-bold">{movie.type}</Text>
            </View>
          )}

          {/* Title and Info Overlay */}
          <View className="absolute bottom-0 left-0 right-0 p-5">
            <Text className="text-white text-4xl font-bold mb-2 tracking-wide">
              {movie?.title}
            </Text>
            {movie?.original_title && movie.original_title !== movie?.title && (
              <Text className="text-light-200 text-lg mb-4">
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
        </View>

        {/* Main Content */}
        <View className="px-5 pt-6">
          {/* Synopsis Section */}
          {movie?.overview && (
            <View className="mb-6">
              <Text className="text-white text-lg font-bold mb-3">
                Synopsis
              </Text>
              <Text className="text-light-200 text-base leading-6">
                {movie.overview}
              </Text>
            </View>
          )}

          {/* Info Section */}
          <View className="mb-6">
            <Text className="text-white text-lg font-bold mb-3">Info</Text>
            <View className="bg-dark-200/70 rounded-2xl p-4">
              {movie?.status && (
                <View className="flex-row py-2 border-b border-dark-300">
                  <Text className="text-light-300 text-sm w-24">Status:</Text>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.status}
                  </Text>
                </View>
              )}
              {movie?.source && (
                <View className="flex-row py-2 border-b border-dark-300">
                  <Text className="text-light-300 text-sm w-24">Source:</Text>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.source}
                  </Text>
                </View>
              )}
              {movie?.episodes && (
                <View className="flex-row py-2 border-b border-dark-300">
                  <Text className="text-light-300 text-sm w-24">Episodes:</Text>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.episodes}
                  </Text>
                </View>
              )}
              {movie?.runtime && (
                <View className="flex-row py-2 border-b border-dark-300">
                  <Text className="text-light-300 text-sm w-24">Duration:</Text>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.runtime} min per ep
                  </Text>
                </View>
              )}
              {movie?.rated && (
                <View className="flex-row py-2 border-b border-dark-300">
                  <Text className="text-light-300 text-sm w-24">Rating:</Text>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.rated}
                  </Text>
                </View>
              )}
              {movie?.season && movie?.year && (
                <View className="flex-row py-2 border-b border-dark-300">
                  <Text className="text-light-300 text-sm w-24">Season:</Text>
                  <Text className="text-white text-sm font-semibold flex-1 capitalize">
                    {movie.season} {movie.year}
                  </Text>
                </View>
              )}
              {movie?.aired && (
                <View className="flex-row py-2 border-b border-dark-300">
                  <Text className="text-light-300 text-sm w-24">Aired:</Text>
                  <Text className="text-white text-sm font-semibold flex-1">
                    {movie.aired}
                  </Text>
                </View>
              )}
              {movie?.broadcast && (
                <View className="flex-row py-2">
                  <Text className="text-light-300 text-sm w-24">
                    Broadcast:
                  </Text>
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
                {movie.genres.map((genre, idx) => (
                  <View
                    key={idx}
                    className="bg-accent/20 px-4 py-2 rounded-full"
                  >
                    <Text className="text-accent text-sm font-medium">
                      {genre.name}
                    </Text>
                  </View>
                ))}
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

                  {/* Gradient Overlay */}
                  <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
                    className="absolute inset-0"
                  />

                  {/* Play Button Overlay */}
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="bg-red-600 rounded-full w-20 h-20 items-center justify-center shadow-lg shadow-black/50">
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
                  relation.entry.map((entry, entryIdx) => (
                    <TouchableOpacity
                      key={`${relationIdx}-${entryIdx}`}
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
                        <View className="flex-1">
                          <Text className="text-white font-semibold text-base mb-1">
                            {entry.name}
                          </Text>
                          <Text className="text-light-300 text-xs">
                            {relation.relation} ({entry.type})
                          </Text>
                        </View>
                        <Image
                          source={icons.arrow}
                          className="size-4"
                          tintColor="#fff"
                        />
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
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
                  className="bg-white/20 rounded-full p-2"
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
                      <View className="absolute inset-0 items-center justify-center bg-black">
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
