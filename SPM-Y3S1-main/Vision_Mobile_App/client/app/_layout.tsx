import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; // Use only one stack navigator
import { onAuthStateChanged, User } from "firebase/auth";
import { View, Text } from "react-native";
import { FIREBASE_AUTH } from "@/cofig/FirebaseConfig";
import SupportFunctionScreen from "./screens/Support";
import HomeScreen from "./screens/Home";
import SearchProduct from "./screens/SearchProduct";
import IdentifyProduct from "./screens/IdentifyProduct";
import OrderHistory from "./screens/Cart";
import Login from "./screens/Login";
import SignUp from "./screens/SignUp";
import ShopUsingVoice from "./screens/Voiceshop";
import ShopUsingNormalUI from "./screens/Visualshop";
import Cart from "./screens/Cart";
import Profile from "./screens/Profile";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      if (initializing) setInitializing(false); // Ensure auth state is initialized before rendering
    });
    return () => unsubscribe();
  }, [initializing]);

  if (initializing) {
    return <LoadingScreen />; // Render a loading screen until auth state is resolved
  }

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide headers for all screens
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="SupportFunction"
              component={SupportFunctionScreen}
            />
            <Stack.Screen name="Voiceshop" component={ShopUsingVoice} />
            <Stack.Screen name="Visualshop" component={ShopUsingNormalUI} />
            <Stack.Screen name="SearchProduct" component={SearchProduct} />
            <Stack.Screen name="IdentifyProduct" component={IdentifyProduct} />
            <Stack.Screen name="OrderHistory" component={OrderHistory} />
            <Stack.Screen name="Cart" component={Cart} />
            <Stack.Screen name="Profile" component={Profile} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Placeholder loading screen component
const LoadingScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Loading...</Text>
    </View>
  );
};
