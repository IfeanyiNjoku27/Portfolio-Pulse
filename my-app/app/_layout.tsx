import { Stack } from "expo-router";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000/graphql";
console.log("Expo is using API URL:", API_URL);

const link = new HttpLink({
  uri: API_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});
const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
});

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>
    </ApolloProvider>
  );
}
