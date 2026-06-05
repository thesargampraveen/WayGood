import React from 'react';
import {
  View,
  Text,
  StyleSheet
} from 'react-native';

const DetailsScreen = ({ route }) => {
  const { university } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {university.university}
      </Text>

      <Text style={styles.country}>
        Country: {university.country}
      </Text>

      <Text style={styles.description}>
        {university.details}
      </Text>
    </View>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  country: {
    fontSize: 18,
    marginVertical: 10
  },
  description: {
    fontSize: 16,
    lineHeight: 24
  }
});