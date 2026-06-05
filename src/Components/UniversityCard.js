import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';

const UniversityCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >
      <Text style={styles.name}>
        {item.university}
      </Text>

      <Text style={styles.country}>
        {item.country}
      </Text>

      <Text style={styles.description}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );
};

export default UniversityCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 3
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  country: {
    color: '#666',
    marginVertical: 5
  },
  description: {
    color: '#444'
  }
});