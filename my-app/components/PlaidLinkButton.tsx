import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { create, LinkExit, LinkSuccess, open, usePlaidEmitter } from 'react-native-plaid-link-sdk';
import { PlaidLinkButtonProps } from '@/types';

// mutation that was made on backend
const GET_LINK_TOKEN = gql`
    mutation GetLinkToken($userId: ID!) {
        createPlaidLinkToken(userId: $userId)
    }
`;

interface GetLinkTokenData {
    createPlaidLinkToken: string;
}

export default function PlaidLinkButton({ userId }: PlaidLinkButtonProps) {
    const [getLinkToken, { loading }] = useMutation<GetLinkTokenData>(GET_LINK_TOKEN);
    const [isPlaidReady, setIsPlaidReady] = useState(false);

    // send token to backend
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
                onSuccess: (sucess: LinkSuccess) => {
                    console.log('Success! Public Token Acquired:', sucess.publicToken);
                    Alert.alert("Bank Connected!", "Public Token recieved");
                },
                onExit: (linkExit: LinkExit) => {
                    console.log('User exited Plaid Link', linkExit);
                }
            });
        } catch (error) {
            console.error("Plaid Error:", error);
            Alert.alert("Error", "Could not initialize bank connection");
        }
    };

    return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={handleConnectBank} 
      disabled={loading}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>Connect Bank Account</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  text: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});