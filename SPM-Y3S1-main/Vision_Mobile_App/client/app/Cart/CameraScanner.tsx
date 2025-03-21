// import React, { useEffect, useState } from 'react';
// import { StyleSheet, Text, View, Alert } from 'react-native';
// import { Camera, useCameraDevices } from 'react-native-vision-camera';
// import { BarcodeFormat, useScanBarcodes } from 'vision-camera-code-scanner';

// export default function CameraScanner() {
//   const [hasPermission, setHasPermission] = useState(false);
//   const devices = useCameraDevices();  // Retrieves all available camera devices
//   const device = devices.back;  // Selects the back camera device

//   // Hook for scanning barcodes
//   const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13]);

//   useEffect(() => {
//     // Function to request camera permissions
//     const getPermissions = async () => {
//       const cameraPermission = await Camera.requestCameraPermission(); // Requesting camera permission
//       if (cameraPermission === 'authorized') {  // Check if permission is granted
//         setHasPermission(true); // Set permission state to true
//       } else {
//         Alert.alert("Permission Required", "Camera permission is required to scan barcodes.");
//       }
//     };

//     getPermissions(); // Invoke the function to request permissions
//   }, []);

//   useEffect(() => {
//     // Handle barcode scan result
//     if (barcodes.length > 0) {
//       const scannedBarcode = barcodes[0].displayValue; // Use displayValue to get the content
//       Alert.alert("Scanned Barcode", `The scanned barcode is: ${scannedBarcode}`);
//       // Implement additional logic to identify the product here
//     }
//   }, [barcodes]);

//   // Render loading text if device is not available or permission is not granted
//   if (!device || !hasPermission) {
//     return <Text>Loading...</Text>;
//   }

//   return (
//     <View style={styles.container}>
//       <Camera
//         style={StyleSheet.absoluteFill}
//         device={device}  // Assign the back camera device
//         isActive={true}  // Make the camera active
//         frameProcessor={frameProcessor}  // Pass frameProcessor to the Camera component
//         frameProcessorFps={5}  // Set frame processor FPS to 5
//       />
//       <Text style={styles.scanText}>Point your camera at a barcode</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scanText: {
//     position: 'absolute',
//     bottom: 50,
//     fontSize: 18,
//     color: '#fff',
//   },
// });
