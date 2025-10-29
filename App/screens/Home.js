import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Image, Text, TouchableOpacity, FlatList, Platform } from 'react-native';
import Logo from '../components/Logo';
import BottomNav from '../components/BottomNav';

export default function Home({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [user, setUser] = useState(null); // null significa não logado

  const receitasRapidas = receitas.filter(r => r.tempo_preparo <= 30);
  const receitasEconomicas = receitas.filter(r => r.custo_aproximado <= 20);
  const receitasFaceis = receitas.filter(r => r.idDificuldade <= 2);
  const receitasProteicas = receitas.filter(r => 
    ['Frango', 'Carne Moída', 'Ovos'].includes(r.ingrediente_base_nome)
  );

  useEffect(() => {
    // Buscar receitas
    fetch('http://localhost:3001/')

      .then((res) => res.json())
      .then((data) => setReceitas(data))
      .catch((err) => console.error('Erro ao carregar receitas:', err));

    // Simular usuário logado
    const loggedUser = null;
    setUser(loggedUser);
  }, []);

  // 🔹 Converte minutos em formato "XhYmin"
  function formatarTempo(minutos) {
    if (!minutos || isNaN(minutos)) return "Tempo não informado";

    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (horas > 0 && mins > 0) return `${horas}h${mins}min`;
    if (horas > 0) return `${horas}h`;
    return `${mins}min`;
  }


  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Logo />

          <View style={styles.searchWrapper}>
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => navigation.navigate('Pesquisa')}
            >
              <Text style={styles.searchText}>🔍 Pesquisar receitas...</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bodyContainer}>
          {/* CATEGORIAS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Categorias</Text>
            <TouchableOpacity onPress={() => navigation.navigate('allCategorias')}>
              <Text style={styles.viewAll}>Ver mais</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categories}>
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: '#FFDE59' }]}
              onPress={() => navigation.navigate('Categoria', { nome: 'Doces' })}
            >
              <Text style={styles.cardText}>Doces</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: '#FF914D' }]}
              onPress={() => navigation.navigate('Categoria', { nome: 'Salgadas' })}
            >
              <Text style={styles.cardText}>Salgadas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: '#82CD47' }]}
              onPress={() => navigation.navigate('Categoria', { nome: 'Bebidas' })}
            >
              <Text style={styles.cardText}>Bebidas</Text>
            </TouchableOpacity>
          </View>

          {/* RECEITAS RECENTES */}
          <View style={styles.sectionHeader}>
            <Text style={styles.subtitle}>Receitas Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('VerMais')}>
              <Text style={styles.viewAll}>Ver mais</Text>
            </TouchableOpacity>
          </View>

          {receitas.length > 0 ? (
            <FlatList
              horizontal
              data={receitas}
              keyExtractor={(item) => item.id_receitas.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recipeCard}
                  onPress={() =>
                    navigation.navigate('ReceitaDet', { id: item.id_receitas })
                  }
                >
                  <Image source={{ uri: item.imagem }} style={styles.recipeImage} />
                  <Text style={styles.recipeTitle}>{item.nome}</Text>
                  <Text style={styles.recipeTime}>
                    ⏱ {formatarTempo(item.tempo_preparo)}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.loading}>Carregando receitas...</Text>
          )}

          {/* 🍓 RECEITAS RÁPIDAS */}
          <View style={styles.section}>
            <Text style={styles.subtitle}>⏱ Receitas Rápidas</Text>
            <FlatList
              horizontal
              data={receitasRapidas}
              keyExtractor={(item) => item.id_receitas.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recipeCard}
                  onPress={() =>
                    navigation.navigate('ReceitaDet', { id: item.id_receitas })
                  }
                >
                  <Image source={{ uri: item.imagem }} style={styles.recipeImage} />
                  <Text style={styles.recipeTitle}>{item.nome}</Text>
                  <Text style={styles.recipeTime}>⏱ {item.tempo_preparo} min</Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* 💰 RECEITAS ECONÔMICAS */}
          <View style={styles.section}>
            <Text style={styles.subtitle}>💰 Receitas Econômicas</Text>
            <FlatList
              horizontal
              data={receitasEconomicas}
              keyExtractor={(item) => item.id_receitas.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recipeCard}
                  onPress={() =>
                    navigation.navigate('ReceitaDet', { id: item.id_receitas })
                  }
                >
                  <Image source={{ uri: item.imagem }} style={styles.recipeImage} />
                  <Text style={styles.recipeTitle}>{item.nome}</Text>
                  <Text style={styles.recipeTime}>
                    💵 R$ {item.custo_aproximado?.toFixed(2) ?? '---'}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* 😌 RECEITAS FÁCEIS */}
          <View style={styles.section}>
            <Text style={styles.subtitle}>😌 Receitas Fáceis</Text>
            <FlatList
              horizontal
              data={receitasFaceis}
              keyExtractor={(item) => item.id_receitas.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recipeCard}
                  onPress={() =>
                    navigation.navigate('ReceitaDet', { id: item.id_receitas })
                  }
                >
                  <Image source={{ uri: item.imagem }} style={styles.recipeImage} />
                  <Text style={styles.recipeTitle}>{item.nome}</Text>
                  <Text style={styles.recipeTime}>
                    ⚙️{' '}
                    {item.idDificuldade === 1
                      ? 'Fácil'
                      : item.idDificuldade === 2
                      ? 'Média'
                      : 'Difícil'}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* 💪 RECEITAS PROTEICAS */}
          <View style={styles.section}>
            <Text style={styles.subtitle}>💪 Ricas em Proteína</Text>
            <FlatList
              horizontal
              data={receitasProteicas}
              keyExtractor={(item) => item.id_receitas.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recipeCard}
                  onPress={() =>
                    navigation.navigate('ReceitaDet', { id: item.id_receitas })
                  }
                >
                  <Image source={{ uri: item.imagem }} style={styles.recipeImage} />
                  <Text style={styles.recipeTitle}>{item.nome}</Text>
                  <Text style={styles.recipeTime}>💪 Proteica</Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} active="Home" isLoggedIn={user !== null} />
    </View>
  );
}

const shadowStyle = Platform.select({
  web: { boxShadow: '0px 3px 6px rgba(0,0,0,0.1)' },
  default: { elevation: 3 },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1, backgroundColor: '#fafafa' },
  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 25,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...shadowStyle,
  },
  logo: { height: 60, resizeMode: 'contain', alignSelf: 'center', marginBottom: 15 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  searchBar: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchText: { color: '#999', fontSize: 15 },
  bodyContainer: { paddingHorizontal: 20, paddingTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#444' },
  viewAll: { color: '#FF914D', fontWeight: '500' },
  categories: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  categoryCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowStyle,
  },
  cardText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginRight: 15,
    padding: 10,
    width: 160,
    ...shadowStyle,
  },
  recipeImage: { width: '100%', height: 110, borderRadius: 10 },
  recipeTitle: { fontWeight: '600', marginTop: 8, color: '#333' },
  recipeTime: { color: '#777', marginTop: 3 },
  loading: { textAlign: 'center', marginTop: 20, color: '#999' },
});
