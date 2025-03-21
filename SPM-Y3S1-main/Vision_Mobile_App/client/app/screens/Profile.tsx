import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { sendPasswordResetEmail, updateEmail, deleteUser } from "firebase/auth";
import { FIREBASE_AUTH } from "@/cofig/FirebaseConfig";

const Details = () => {
  const [user, setUser] = useState<any>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = FIREBASE_AUTH.currentUser;
    setUser(currentUser);
  }, []);

  // Logout function
  const handleLogout = () => {
    FIREBASE_AUTH.signOut()
      .then(() => {
        navigation.replace("Login"); // Navigate to login after logout
      })
      .catch((error) => {
        console.error("Logout failed: ", error);
      });
  };

  // Function to trigger password reset email
  const handleChangePassword = () => {
    if (user?.email) {
      sendPasswordResetEmail(FIREBASE_AUTH, user.email)
        .then(() => {
          Alert.alert(
            "Password Reset",
            "A password reset email has been sent to your email address."
          );
        })
        .catch((error) => {
          console.error("Password reset failed: ", error);
        });
    }
  };

  // Function to change email
  const handleChangeEmail = () => {
    const newEmail = "newemail@example.com"; // Replace with user input for the new email
    if (user) {
      updateEmail(user, newEmail)
        .then(() => {
          Alert.alert("Email Changed", "Your email has been updated.");
        })
        .catch((error) => {
          console.error("Email update failed: ", error);
        });
    }
  };

  // Function to delete user account
  const handleDeleteAccount = () => {
    if (user) {
      deleteUser(user)
        .then(() => {
          Alert.alert("Account Deleted", "Your account has been deleted.");
          navigation.replace("Login"); // Navigate to login after account deletion
        })
        .catch((error) => {
          console.error("Account deletion failed: ", error);
        });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <Text style={styles.emailTitle}>Email</Text>
      <Text style={styles.email}>{user?.email || "No email available"}</Text>

      {/* Button to change password */}
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      {/* Button to change email */}
      <TouchableOpacity style={styles.button} onPress={handleChangeEmail}>
        <Text style={styles.buttonText}>Change Email</Text>
      </TouchableOpacity>

      {/* Button to delete account */}
      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>

      {/* Logout button */}
      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    backgroundColor: "#000", // Set background color to black
    padding: 20,
    paddingBottom: 80, // Add padding at the bottom to make room for the logout button
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff", // Set text color to white
  },
  emailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#fff", // Set text color to white
  },
  email: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#fff", // Set text color to white
  },
  button: {
    backgroundColor: "#fff", // Set button color to white
    borderRadius: 10,
    paddingVertical: 40, // Increase vertical padding
    paddingHorizontal: 40, // Increase horizontal padding
    marginVertical: 15, // Increase vertical margin
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "#000", // Set button text color to black
    fontSize: 25, // Increase font size
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FF4C4C", // Red color for delete button
  },
  logoutButton: {
    backgroundColor: "#FF4C4C", // Red color for logout button
    position: "absolute",
    bottom: 20,
  },
});

export default Details;
