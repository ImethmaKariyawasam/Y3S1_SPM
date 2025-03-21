import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../cofig/FirebaseConfig'; // Correct path
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const SignUp = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const signUp = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      // Store user details in Firestore
      await setDoc(doc(FIRESTORE_DB, 'users', user.uid), {
        name,
        address,
        phone,
        email,
      });

      alert('Account created successfully!');
      console.log('Navigating to Login');  // Debugging line to check if this is hit
      navigation.navigate('Login'); // Ensure this matches the screen name in the Stack.Navigator
    } catch (error:any) {
      console.log(error);
      alert('Sign Up failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/black.png')} style={styles.logo} />

      <TextInput
        value={name}
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#fff"
        onChangeText={(text) => setName(text)}
      />
      <TextInput
        value={address}
        style={styles.input}
        placeholder="Address"
        placeholderTextColor="#fff"
        onChangeText={(text) => setAddress(text)}
      />
      <TextInput
        value={phone}
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#fff"
        onChangeText={(text) => setPhone(text)}
      />
      <TextInput
        value={email}
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#fff"
        autoCapitalize="none"
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        secureTextEntry={true}
        value={password}
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#fff"
        autoCapitalize="none"
        onChangeText={(text) => setPassword(text)}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <>
          <TouchableOpacity style={styles.signUpButton} onPress={signUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>
              Have an account? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Black background
    padding: 20,
  },
  logo: {
    width: 300,  // Large logo size
    height: 250,
    marginBottom: 0,
    resizeMode: 'contain',
  },
  input: {
    width: '100%',
    marginVertical: 10,
    height: 60,  // Large input fields
    borderWidth: 2,
    borderColor: '#fff', // White borders
    borderRadius: 15,
    paddingHorizontal: 20,
    backgroundColor: '#333', // Dark background for inputs
    fontSize: 18,
    color: '#fff', // White text
  },
  signUpButton: {
    backgroundColor: '#fff', // White button background
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 50,
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  signUpButtonText: {
    color: '#000', // Black text
    fontSize: 20,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#fff', // White text
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  loginLink: {
    color: '#fff', // White link text
    fontWeight: 'bold',
    fontSize: 18,
    textDecorationLine: 'underline',
  },
});

export default SignUp;
