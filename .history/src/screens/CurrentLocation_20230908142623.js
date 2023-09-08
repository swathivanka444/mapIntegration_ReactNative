import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geolocation from "react-native-geolocation-service";
import { TextInput } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useIsFocused } from "@react-navigation/native";
import Geocoder from "react-native-geocoding";
const CurrentLocation = ({ navigation, route }) => {
  const [markerCoords, setMarkerCoords] = useState({
    latitude: 17.385,
    longitude: 78.4867,
  });
  const [currentRegion, setCurrentRegion] = useState({
    latitude: 17.385,
    longitude: 78.4867,
    latitudeDelta: 0.392768,
    longitudeDelta: 0.992736,
  });
  const [text, setText] = useState("");
  const [mLat, setMLat] = useState(0);
  const [mLong, setMlong] = useState(0);
  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const message = `Latitude: ${latitude}, Longitude: ${longitude}`;
    // const message = "Latitude: " + latitude + ", Longitude: " + longitude;
    alert(message);
  };
  useEffect(() => {
    requestCameraPermission();
  }, [])
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your Location ' +
            'so you can take awesome pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the Location');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn('Error', err);
    }
  };
  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('position', position);
        console.log('latitute', position.coords.latitude)
        setMLat(position.coords.latitude)
        setMlong(position.coords.longitude)
      },
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }
  const handleIconPress = () => {
    navigation.navigate("SearchPlaces")
  }
  const [locValue, setLocValue] = useState("");
  const [refresh, setRefresh] = useState(0);
  const isFocussed = useIsFocused();
  const params = route.params;
  useEffect(() => {
    console.log('routee**', params);
    if (route && params && params.type) {
      setLocValue(params.text);
      reverseGeocodeCoordinates(params.type.lat, params.type.lng)
    }
  }, [])

  const reverseGeocodeCoordinates = async (latitude, longitude) => {
    console.log("longitude,latitude**", latitude, longitude);
    try {
      const response = await Geocoder.from(latitude, longitude);
      console.log("response***", response)
      const address = response.results[0].formatted_address;
      setLocValue(response.results[0].formatted_address);
      setMarkerCoords({
        latitude: response.results[0].geometry.location.lat,
        longitude: response.results[0].geometry.location.lng
      })
      setCurrentRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0,
        longitudeDelta: 0
      })
      console.log('Address**', response);
      const pinCode=extractPincodeFromAddress(address);
      console.log("pinCode***",pinCode)
    }
    catch (error) {
      console.log('error in reverseGeocodeCoordinates', error);
    }
  }
  const extractPincodeFromAddress=(address)=>{
    const pincodeRegex = /\b\d{6}\b/g; // Assumes a 6-digit pincode format
    const matches = address.match(pincodeRegex);
    return matches ? matches[0] : 'N/A';
  }
  return (
    <>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, marginHorizontal: 5, padding: 10 }}>

          <TextInput
            style={{ flex: 1, marginLeft: 10, }}
            onChangeText={setText}
            value={Text}
            placeholder="Search"
          />
          <Icon name="search" size={20} color="black" onPress={handleIconPress} />
        </View>
        <MapView
          style={{ width: '100%', height: '100%' }}
          initialRegion={currentRegion}
          onRegionChange={x => {
            console.log("x----", x);
          }}
          onPress={handleMapPress}
        >
          <Marker
            draggable
            coordinate={markerCoords}
            title="Marker Title"
            description="Marker Description"
          />
        </MapView>
        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', width: '90% ', height: '50', alignSelf: 'center', position: 'absolute', bottom: 20, backgroundColor: 'orange' }}
          onPress={() => { getLocation() }}
        >

          <Text style={{ color: '#fff' }}>Get current Location</Text>
        </TouchableOpacity>
      </View>
    </>
  )
};

export default CurrentLocation;