import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import {
  create,
  LinkExit,
  LinkSuccess,
  open,
  usePlaidEmitter,
} from "react-native-plaid-link-sdk";
import { PlaidLinkButtonProps } from "@/types";

// mutation that was made on backend
const GET_LINK_TOKEN = gql`
  mutation GetLinkToken($userId: ID!) {
    createPlaidLinkToken(userId: $userId)
  }
`;
const EXCHANGE_PUBLIC_TOKEN = gql`
    mutation ExchangePublicToken($publicToken: String!, $userId: ID!) {
        exchangePublicToken(publicToken: $publicToken, userId: $userId)
    }
`;
const SYNC_TRANSACTIONS = gql`
    mutation SyncPlaidTransactions($userId: ID!) {
        syncPlaidTransactions(userId: $userId)
    }
`;

interface GetLinkTokenData {
  createPlaidLinkToken: string;
}
interface ExchangeTokenData {
  exchangePublicToken: boolean;
}
interface SyncData {
    syncPlaidTransactions: boolean;
}


export default function PlaidLinkButton({ userId }: PlaidLinkButtonProps) {
  const [getLinkToken, { loading: linkloading }] =
    useMutation<GetLinkTokenData>(GET_LINK_TOKEN);

  const [exchangeToken, { loading: exhangeLoading }] =
    useMutation<ExchangeTokenData>(EXCHANGE_PUBLIC_TOKEN);

    const [syncTransactions] = useMutation<SyncData>(SYNC_TRANSACTIONS, {
        refetchQueries: ["GetUserData"], //update dashboard instantly
    });

  const [isPlaidReady, setIsPlaidReady] = useState(false);

  const handleConnectBank = async () => {
    try {
      // request link token from backend
      const { data } = await getLinkToken({ variables: { userId } });
      const linkToken = data?.createPlaidLinkToken;

      if (!linkToken) throw new Error("No token recieved");

      // initialize plaid sdk
      create({ token: linkToken });
      setIsPlaidReady(true);

      open({
        onSuccess: async (sucess: LinkSuccess) => {
          console.log("Success! Public Token Acquired, sending to backend...", sucess.publicToken);

          // send token to backend
          try {
            await exchangeToken({
              variables: {
                publicToken: sucess.publicToken,
                userId: userId,
              },
            });

            // sync transactions
            console.log('Token exchanged! Syncing transactions...');
            await syncTransactions({
                variables: { userId: userId }
            });

            Alert.alert("Bank Connected!", "Public Token recieved");

          } catch (err) {
            console.error("Exchange Error:", err);
            Alert.alert("Error", "Failed to link bank to your account.");
          }
        },
        onExit: (linkExit: LinkExit) => {
          console.log("User exited Plaid Link", linkExit);
        },
      });
    } catch (error) {
      console.error("Plaid Error:", error);
      Alert.alert("Error", "Could not initialize bank connection");
    }
  };

  const isLoading = linkloading || exhangeLoading;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleConnectBank}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>Connect Bank Account</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#000000",
    borderColor: "#FFFFFF",
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  text: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
