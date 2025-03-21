import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH } from '@/cofig/FirebaseConfig';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation();

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/black.png')} style={styles.logo} />

      <TextInput
        value={email}
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        placeholderTextColor="#fff"
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        secureTextEntry={true}
        value={password}
        style={styles.input}
        placeholder="Password"
        autoCapitalize="none"
        placeholderTextColor="#fff"
        onChangeText={(text) => setPassword(text)}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <>
          <TouchableOpacity style={styles.signUpButton} onPress={signIn}>
            <Text style={styles.signUpButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.loginText}>
              Don't have an account? <Text style={styles.loginLink}>Sign Up</Text>
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
    width: 250,  // Even larger logo size
    height: 250,
    marginBottom: 0, // More space below the logo
    resizeMode: 'contain',
  },
  input: {
    width: '100%',
    marginVertical: 12,
    height: 60,  // Large input field
    borderWidth: 2,
    borderColor: '#fff', // White border for input fields
    borderRadius: 15,
    paddingHorizontal: 20,
    backgroundColor: '#333', // Dark background for input field
    fontSize: 18,
    color: '#fff', // White text for input
  },
  signUpButton: {
    backgroundColor: '#fff', // White background for the button
    borderRadius: 30,  // Rounded corners
    paddingVertical: 20,
    paddingHorizontal: 50,
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  signUpButtonText: {
    color: '#000', // Black text for buttons
    fontSize: 20,  // Larger text
    fontWeight: 'bold',
  },
  loginText: {
    color: '#fff', // White text
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  loginLink: {
    color: '#fff', // White link for sign-up
    fontWeight: 'bold',
    fontSize: 18,
    textDecorationLine: 'underline', // Underline for clarity
  },
});

export default Login;
