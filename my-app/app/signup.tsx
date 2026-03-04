import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useRouter } from "expo-router";
import { auth } from "../utils/firebaseConfig";
import Login from "./login";

// Define graphql mutation
const CREATE_USER_MUTATION = gql`
  mutation CreateUser($id: ID!, $firstName: String!, $email: String!) {
    createUser(id: $id, firstName: $firstName, email: $email) {
      id
      firstName
    }
  }
`;

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  // initialize apollo mutation hook
  const [createUserInDB] = useMutation(CREATE_USER_MUTATION);

  const handleSignUp = async () => {
    if (!firstName || !email || !password) {
        Alert.alert("Error", "Please fill out all fields");
        return;
    }

    setIsLoading(true);
    try {
        // Create user in firebase first 
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // send new firebase uid to database
        await createUserInDB({
            variables: {
                id: firebaseUser.uid,
                firstName: firstName,
                email: email,
            }
        });

        // upon success, route user to dashboard
        Alert.alert("Success", "Account created Sucessfully!")
        router.replace('/')

    } catch (error: any) {
        Alert.alert("Regristration Failed", error.message);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('./login')}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f5f5f5' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontSize: 14 }
});