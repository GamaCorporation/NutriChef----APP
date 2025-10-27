import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Header from '../../components/Voltar';

export default function Pesquisa({ navigation }) {
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    console.log('Buscar:', search);
    navigation.navigate('Resultado', { termo: search });
  };

  const ingredientes = ['Cebola', 'Leite', 'Margarina', 'Alho', 'Arroz', 'Cenoura', 'Batata', 'Macarrão'];
  const carnes = ['Carne moída', 'Bife', 'Peito de frango', 'Lombo de porco'];
  const verdurasFrutas = ['Tomate', 'Alface', 'Couve', 'Abacaxi'];

  // Função React para adicionar ingrediente ao search
  const adicionarIngrediente = (item) => {
    setSearch(prev => {
      let novo = prev.trim();
      if (novo && !novo.endsWith(',')) novo += ', ';
      return novo + item;
    });
  };

  const renderButtons = (items, color) => (
    <View style={[styles.suggestionGrid, { backgroundColor: color }]}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={styles.suggestionButton}
          onPress={() => adicionarIngrediente(item)}
        >
          <Text style={styles.buttonText}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Header navigation={navigation}/>

        {/* Input de pesquisa */}
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar receitas"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

      {/* Info */}
      <Text style={styles.infoText}>
        Assumimos que os ingredientes obrigatórios são: água, sal e pimenta.
      </Text>

      {/* Sugestões */}
      <Text style={styles.sectionTitle}>Sugestões de ingredientes:</Text>
      {renderButtons(ingredientes, '#ff4d4d')}

      <Text style={styles.sectionTitle}>Sugestões de carnes:</Text>
      {renderButtons(carnes, '#ff914d')}

      <Text style={styles.sectionTitle}>Sugestões de verduras e frutas:</Text>
      {renderButtons(verdurasFrutas, '#82cd47')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backBtn: {
    marginRight: 10,
  },
  backText: {
    fontSize: 24,
    color: '#333',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  infoText: {
    marginVertical: 10,
    fontSize: 14,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
  },
  suggestionButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
    elevation: 2,
  },
  buttonText: {
    color: '#333',
    fontWeight: '500',
  },
});
