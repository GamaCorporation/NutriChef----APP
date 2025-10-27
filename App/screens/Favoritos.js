import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  useWindowDimensions 
} from 'react-native';
import Header from '../components/Voltar';
import BottomNav from '../components/BottomNav';

const initialReceitas = [
  {
    id: '1',
    nome: 'Pudim de Microondas',
    tempo: '10 - 70 min',
    imagem: 'https://www.receiteria.com.br/wp-content/uploads/receitas-de-pudim-de-leite-condensado.jpg',
  },
  {
    id: '2',
    nome: 'Panqueca de Carne',
    tempo: '40 - 170 min',
    imagem: 'https://tudodelicious.com/wp-content/uploads/2025/04/Panqueca-de-carne-moida-1024x1024.jpg',
  },
  {
    id: '3',
    nome: 'Salada Caesar',
    tempo: '40 - 90 min',
    imagem: 'https://p2.trrsf.com/image/fget/cf/1200/900/middle/images.terra.com/2023/02/28/whatsapp-image-2023-02-28-at-01-53-47-(1)-1iyhprrq5e9tc.jpeg',
  },
];

export default function Favoritos({ navigation, usuario }) {
  const [receitas, setReceitas] = useState(initialReceitas);
  const { width } = useWindowDimensions();

  const numColumns = width > 400 ? 2 : 1;
  const cardWidth = (width - 30 - (numColumns - 1) * 15) / numColumns;

  const removerFavorito = (id) => {
    setReceitas((prev) => prev.filter((r) => r.id !== id));
  };

  const renderItem = ({ item }) => (
    <View style={[styles.recipeCard, { width: cardWidth }]}>
      <Image
        source={{ uri: item.imagem }}
        style={[styles.recipeImage, { height: 120 }]}
        resizeMode="cover"
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.nome}</Text>
        <Text style={styles.recipeTime}>⏱ {item.tempo}</Text>
      </View>
      <TouchableOpacity style={styles.heartBtn} onPress={() => removerFavorito(item.id)}>
        <Text style={styles.heartText}>❤️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <FlatList
        key={numColumns} // força reconstrução quando numColumns muda
        contentContainerStyle={styles.content}
        data={receitas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between', marginBottom: 15 } : null}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma receita favorita ainda.</Text>}
      />

      <BottomNav navigation={navigation} active="Favoritos" isLoggedIn={usuario != null} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  recipeInfo: {
    padding: 10,
  },
  recipeName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#444',
  },
  recipeTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  heartText: {
    fontSize: 22,
  },
});
