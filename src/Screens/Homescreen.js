import React from 'react';
import {
  View,
  FlatList,
  StyleSheet
} from 'react-native';

import { universities} from '../Data/Univercity';
import UniversityCard from '../Components/UniversityCard';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={universities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <UniversityCard
            item={item}
            onPress={() =>
              navigation.navigate(
                'Details',
                { university: item }
              )
            }
          />
        )}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15
  }
});