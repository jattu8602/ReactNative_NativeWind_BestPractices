import { useMemo } from 'react'

import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Ionicons } from '@expo/vector-icons'

import MovieCard from '@/components/MovieCard'
import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { useFavorites } from '@/contexts/FavoritesContext'

const Save = () => {
  const { favorites, hydrated, toggleFavorite } = useFavorites()

  const sortedFavorites = useMemo(
    () =>
      [...favorites].sort(
        (a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime()
      ),
    [favorites]
  )

  return (
    <SafeAreaView className="bg-primary flex-1">
      <Image source={images.bg} className="absolute w-full h-full z-0" resizeMode="cover" />

      <View className="flex-1 px-5 pt-16 pb-5">
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Image source={icons.save} className="w-8 h-8" tintColor="#fff" />
            <View>
              <Text className="text-white text-2xl font-bold">Saved Anime</Text>
              <Text className="text-light-300 text-sm">
                {favorites.length} {favorites.length === 1 ? 'title' : 'titles'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="px-4 py-2 rounded-full bg-white/10 border border-white/10"
            activeOpacity={0.8}
            disabled
          >
            <Text className="text-white text-xs uppercase tracking-widest">Auto-Saved</Text>
          </TouchableOpacity>
        </View>

        {!hydrated ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="text-light-300 mt-3 text-sm">Loading your saved anime...</Text>
          </View>
        ) : (
          <FlatList
            data={sortedFavorites}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'flex-start', gap: 16, marginBottom: 20 }}
            contentContainerStyle={{
              paddingBottom: 120,
              minHeight: '60%',
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="relative">
                <MovieCard {...item} />
                <TouchableOpacity
                  accessibilityLabel="Remove from saved"
                  accessibilityRole="button"
                  onPress={() => toggleFavorite(item)}
                  className="absolute -top-2 -right-2 bg-black/80 border border-white/10 rounded-full p-1.5"
                  activeOpacity={0.85}
                >
                  <Ionicons name="heart" size={14} color="#f87171" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Image source={icons.save} className="w-16 h-16 mb-6" tintColor="#9ca3af" />
                <Text className="text-center text-white text-lg font-semibold mb-2">
                  No saved anime yet
                </Text>
                <Text className="text-center text-light-200 text-sm px-6 leading-5">
                  Tap the heart icon on an anime detail page to add it to your personal vault.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default Save
