import { Stack } from "expo-router";
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';


const API_URL = 'http://localhost:4000/graphql';
const link = new HttpLink({
  uri: API_URL,
});
const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache(),
});

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false}} />
        <Stack.Screen name="signup" options={{ headerShown: false}} />
        </Stack>
    </ApolloProvider>

  );
}
