import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Header from '../../components/Voltar';

import cBebidas from '../../assets/img/cardCategorias/cBebidas.jpg';
import cBolos from '../../assets/img/cardCategorias/cBolos.jpg';
import cDoces from '../../assets/img/cardCategorias/cDoces.jpg';
import cLanches from '../../assets/img/cardCategorias/cLanches.jpg';
import cMassas from '../../assets/img/cardCategorias/cMassas.jpg';
import cSalgados from '../../assets/img/cardCategorias/cSalgados.jpg';
import BottomNav from '../../components/BottomNav';

const categorias = [
  { name: 'Bebidas', image: cBebidas },
  { name: 'Bolos', image: cBolos },
  { name: 'Doces', image: cDoces },
  { name: 'Lanches', image: cLanches },
  { name: 'Massas', image: cMassas },
  { name: 'Salgados', image: cSalgados },
];

export default function AllCategorias({ navigation }) {
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Categorias</Text>
        <View style={styles.categories}>
          {categorias.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigation.navigate('Categoria', { nome: cat.name })}
            >
              <Image source={cat.image} style={styles.cardImage} resizeMode="cover" />
              <Text style={styles.cardTitle}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* BottomNav fixo */}
      <BottomNav navigation={navigation} active="allCategorias" />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd' },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // espaço extra para não cortar conteúdo atrás do BottomNav
    alignItems: 'center',
  },
  title: { fontSize: 24, marginVertical: 20, fontWeight: 'bold', color: '#333' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: 150,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    backgroundColor: '#fff',
  },
  cardImage: { width: '100%', height: 100, borderRadius: 4 },
  cardTitle: { marginTop: 10, fontWeight: 'bold', fontSize: 16, color: '#333' },
});
