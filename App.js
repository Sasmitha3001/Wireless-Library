import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import WriterScreen from './Screens/WriterScreen' ;
import Reader from './Screens/Reader';


export default class App extends Component{
  render(){
    return(
      <View>
        <AppNavigator/>
      </View>
    )
  }
}

const TabNavigator=createBottomTabNavigator({
  Writer:{screen:WriterScreen},
  Reader:{screen:Reader}
},
{defaultNavigationOption:({navigation})=>{
  const routeNavigation=navigation.state.navigation
  if(routeNavigation===Writer){
    return(
      <Image
      source={require('./assets/write.png')}
      style={{width:40,height:40}}
      />
    )
  }
  else{
    return(
      <Image
      source={require('./assets/read.png')}
      style={{width:40,height:40}}
      />
    )
  }
}
  
})

const AppNavigator=createAppContainer(TabNavigator)

