// Logo.jsx
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function Logo() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/img/logo.png')} // caminho para seu logo local
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  logo: {
    width: 200,  // tamanho fixo
    height: 100, // tamanho fixo
  },
});
