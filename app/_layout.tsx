import { Stack } from 'expo-router'
import { Platform, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import '../app/globals.css'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#030014' }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            fullScreenGestureEnabled: Platform.OS === 'ios',
            contentStyle: { backgroundColor: '#030014' },
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="movie/[id]"
            options={{
              headerShown: false,
              animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              fullScreenGestureEnabled: Platform.OS === 'ios',
              contentStyle: { backgroundColor: '#030014' },
            }}
          />
        </Stack>
      </View>
    </GestureHandlerRootView>
  )
}
