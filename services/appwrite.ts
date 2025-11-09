import { Client, Databases, ID, Query } from 'react-native-appwrite'

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID
const COLLECTION_NAME =
  process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_NAME || 'searches'

// Only initialize Appwrite if project and database IDs are present
const isAppwriteConfigured = DATABASE_ID && PROJECT_ID

let database: Databases | null = null
let cachedCollectionId: string | null = COLLECTION_ID || null

if (isAppwriteConfigured) {
  const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID!)

  database = new Databases(client)
}

// Helper function to get collection ID
// If COLLECTION_ID is not set, we'll try to find it from the collection name
// Note: This requires the collection ID to be set in env, or we skip Appwrite features
const getCollectionId = (): string | null => {
  // If collection ID is explicitly set, use it
  if (COLLECTION_ID) {
    return COLLECTION_ID
  }

  // Collection ID is required for Appwrite operations
  // If not set, return null and Appwrite features will be skipped
  console.warn(
    'Collection ID not found. Please set EXPO_PUBLIC_APPWRITE_COLLECTION_ID in your .env file, or Appwrite features will be disabled.'
  )
  return null
}

export const updateSearchCount = async (query: string, movie: Movie) => {
  if (!isAppwriteConfigured || !database) {
    console.log('Appwrite not configured, skipping search count update')
    return
  }

  const collectionId = getCollectionId()
  if (!collectionId) {
    console.log('Collection not found, skipping search count update')
    return
  }

  try {
    const result = await database.listDocuments(DATABASE_ID!, collectionId, [
      Query.equal('searchTerm', query),
    ])

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0]
      await database.updateDocument(
        DATABASE_ID!,
        collectionId,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      )
    } else {
      await database.createDocument(DATABASE_ID!, collectionId, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url:
          movie.poster_path || 'https://placehold.co/600x400/1a1a1a/FFFFFF.png',
      })
    }
  } catch (error) {
    console.error('Error updating search count:', error)
    // Don't throw - just log the error so it doesn't break the app
  }
}

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  if (!isAppwriteConfigured || !database) {
    console.log('Appwrite not configured, returning empty trending movies')
    return undefined
  }

  const collectionId = getCollectionId()
  if (!collectionId) {
    console.log('Collection not found, returning empty trending movies')
    return undefined
  }

  try {
    const result = await database.listDocuments(DATABASE_ID!, collectionId, [
      Query.limit(5),
      Query.orderDesc('count'),
    ])

    return result.documents as unknown as TrendingMovie[]
  } catch (error) {
    console.error('Error fetching trending movies:', error)
    return undefined
  }
}
