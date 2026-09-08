import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigation from './src/Navigation/AppNavigation';
import { COLORS } from './src/theme';

const Root = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <AppNavigation />;
};

const App = () => (
  <AuthProvider>
    <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
    <Root />
  </AuthProvider>
);

export default App;

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
});
