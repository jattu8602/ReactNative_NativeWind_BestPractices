import { Link } from 'expo-router'
import { Image, Text, TouchableOpacity, View } from 'react-native'

import { icons } from '@/constants/icons'

interface MovieCardProps extends Movie {
  containerClassName?: string
  imageClassName?: string
}

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
  containerClassName,
  imageClassName,
}: MovieCardProps) => {
  const containerClasses = containerClassName ?? 'w-[30%]'
  const imageClasses = imageClassName ?? 'w-full h-52 rounded-lg'

  return (
    <Link href={`/movie/${id}`} asChild>
      <TouchableOpacity className={containerClasses}>
        <Image
          source={{
            uri: poster_path
              ? poster_path
              : 'https://placehold.co/600x400/1a1a1a/FFFFFF.png',
          }}
          className={imageClasses}
          resizeMode="cover"
        />

        <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
          {title}
        </Text>

        <View className="flex-row items-center justify-start gap-x-1">
          <Image source={icons.star} className="size-4" />
          <Text className="text-xs text-white font-bold uppercase">
            {Math.round(vote_average / 2)}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-light-300 font-medium mt-1">
            {release_date?.split('-')[0]}
          </Text>
          <Text className="text-xs font-medium text-light-300 uppercase">
            Anime
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  )
}

export default MovieCard
