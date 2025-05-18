//App.tsx
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  Text,
  SafeAreaView,
  Platform,
  View,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Sensor from './mqttSubs';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const textColor = isDarkMode ? Colors.white : Colors.black;

  return (
    <SafeAreaView style={[backgroundStyle, styles.safeArea]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.extraTopPadding} />

      <View style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>
          Alertas del Sistema de Invernadero
        </Text>
        
        <Sensor />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    paddingBottom: 24,
    flex: 1,
  },
  extraTopPadding: {
    height: 12,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25, 
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default App;
