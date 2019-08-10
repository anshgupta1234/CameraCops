import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ImageEditor } from 'react-native';
import { Header, Left, Right, Body } from 'native-base'
import { Camera } from "expo-camera";
import * as Permissions from 'expo-permissions'
import Swiper from 'react-native-swiper'
import {Card} from "react-native-elements";

export default class CameraScreen extends Component{

  async componentDidMount(){
    await this.askPermissions();
    this.takePicture();
    console.disableYellowBox = true;
  }

  checkLicense = (bytes) => {
    fetch(`https://api.openalpr.com/v2/recognize_bytes?secret_key=SECRET&recognize_vehicle=1&country=us&state=ca&return_image=0`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: bytes,
    }).catch(e => console.log("ERROR" + e))
      .then(response => response.json())
      .then(response => {
        if(response.results.length > 0){
          for(let i = 0; i < response.results.length; i++){
            const plate = response.results[i].plate;
            if(!this.state.caughtPlatesNames.includes(plate) && !this.state.registeredPlates.includes(plate) && response.results[i].confidence > 87.5){
              try {
                const { x, y, width, height } = response.results[i].vehicle_region;
                console.log(x + " " + y + " " + width + " " + height + " " );
                const obj = {
                  plate: plate,
                  car: response.results[i].vehicle.body_type[0].name,
                  color: response.results[i].vehicle.color[0].name,
                  year: response.results[i].vehicle.year[0].name,
                  confidence: response.results[i].confidence
                };
                this.setState({ caughtPlates: [obj, ...this.state.caughtPlates], caughtPlatesNames: [plate, ...this.state.caughtPlatesNames] })
              } catch (e) {
                console.log(e)
              }
            }
          }
        }
      });
  };

  takePicture = async() => {
    await setInterval(async() => {
      let photo = await this.camera.takePictureAsync({ quality: 0.75, base64: true, });
      this.checkLicense(photo.base64)
    }, 4000)
  };

  state = {
    isLoaded: false,
    takePicture: true,
    addedItems: [],
    registeredPlates: [
      'BLDLYGO',
      'BLDLYG0',
      'TOY123',
      'W6EEN',
      'TSLA10',
      'BW5F851',
      'BV5F851',
      'VOXEIXR',
      'V0XFTXR',
      'V0XFIXR',
      'VOXFTXR',
      'VDXFTXR',
      'VDXFIXR',
      'TDY123',
      'TOYI23',
      'TSLAI0',
      'W6EENH',
      'V6EENH'
    ],
    latestItem: '',
    caughtPlates: [],
    caughtPlatesNames: [],
  };


  askPermissions = async() => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if(status === 'granted'){
      this.setState({ isLoaded: true })
    }
  };


  render(){
    return(
      <View style={{ flex: 1 }}>
        <Header style={{ backgroundColor: '#fff' }} noLeft={true}>
          <Body>
            <Text>CameraCops</Text>
          </Body>
          <Right />
        </Header>
        {
          this.state.isLoaded && (
            <Swiper showsPagination={false} loop={false}>
              <Camera style={{ flex: 1 }} ref={ref => this.camera = ref} type={Camera.Constants.Type.back} />
              <View style={{ flex: 1, backgroundColor: '#7c7cff' }}>
                <ScrollView>
                  {this.state.caughtPlates.map(item => (
                    <Card containerStyle={{ borderRadius: 10, borderColor: 'white', borderWidth: 1, padding: 10, marginHorizontal: 5, marginTop: 5 }}>
                      <Text style={{ fontSize: 14, }}>Plate: {item.plate}</Text>
                      <Text style={{ fontSize: 12, }}>Model: {item.car + ", " + item.year}</Text>
                      <Text style={{ fontSize: 12, }}>Color: {item.color}</Text>
                      <Text style={{ fontSize: 12, }}>Confidence: {item.confidence}</Text>
                    </Card>
                  ))}
                </ScrollView>
              </View>
            </Swiper>
          )
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  camContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  displayContainer: {
    marginBottom: 40,
    height: 100,
    width: '85%',
    backgroundColor: 'green',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

