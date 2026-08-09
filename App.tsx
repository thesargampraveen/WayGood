import { View, Text, Button } from 'react-native'
import React from 'react'

const App = ({navigation}) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Press me" onPress={() =>navigation.navigate(
                'Data',
               
              )} />
    </View>
  )
}

export default App