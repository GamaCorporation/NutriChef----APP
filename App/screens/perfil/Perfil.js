import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Header from "../../components/Voltar";
import BottomNav from "../../components/BottomNav";

export default function Perfil() {
  const navigation = useNavigation();
  const [usuario, setUsuario] = useState(null);
  const [receitasFavoritas, setReceitasFavoritas] = useState([]);
  const [receitasPublicadas, setReceitasPublicadas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ Substitua pelo IP da sua máquina para funcionar no celular/web
  const baseURL = "http://localhost:3001";

  const fetchPerfil = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseURL}/perfil`, { credentials: "include" });
      const data = await res.json();
      if (data.success && data.usuario) {
        setUsuario(data.usuario);
        setReceitasFavoritas(data.usuario.favoritas || []);
        setReceitasPublicadas(data.usuario.publicadas || []);
      } else {
        navigation.replace("CadastroLogin");
      }
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      navigation.replace("CadastroLogin");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPerfil();
    }, [])
  );

  const handleLogout = () => {
    const logoutFetch = async () => {
      try {
        const res = await fetch(`${baseURL}/nutrichef/1.0.0/logout`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) navigation.replace("CadastroLogin");
        else alert(data.message || "Erro ao deslogar");
      } catch (err) {
        console.error(err);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Deseja realmente encerrar a sessão?")) logoutFetch();
    } else {
      Alert.alert(
        "Sair",
        "Deseja realmente encerrar a sessão?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sair", style: "destructive", onPress: logoutFetch },
        ],
        { cancelable: true }
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#ff6a00" />
        <Text>Carregando usuário...</Text>
      </View>
    );
  }

  if (!usuario) return null;

  // URL absoluta da foto do usuário, adiciona timestamp para evitar cache
  const fotoUri = usuario.foto
    ? `${baseURL}${usuario.foto.startsWith("/") ? usuario.foto : "/" + usuario.foto}?t=${new Date().getTime()}`
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <ScrollView style={styles.container}>
      <Header navigation={navigation} />

      <View style={styles.perfilInfo}>
        <Image source={{ uri: fotoUri }} style={styles.perfilFoto} />
        <Text style={styles.perfilNome}>{usuario.nome}</Text>
        <TouchableOpacity style={styles.configBtn} onPress={() => navigation.navigate("AlterPerfil")}>
          <Text style={styles.configIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Receitas favoritas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receitas favoritas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
          {receitasFavoritas.length > 0 ? (
            receitasFavoritas.map((r, i) => (
              <View key={i} style={styles.receitaCard}>
                <Image source={{ uri: r.imagem.startsWith("/") ? `${baseURL}${r.imagem}` : r.imagem }} style={styles.receitaImg} />
                <Text style={styles.receitaNome}>{r.nome}</Text>
                <Text style={styles.favorito}>❤️</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: "#888", marginLeft: 5 }}>Nenhuma receita favorita</Text>
          )}
        </ScrollView>
      </View>

      {/* Receitas publicadas */}
      <View style={styles.section}>
        <View style={styles.tituloLinha}>
          <Text style={styles.sectionTitle}>Receitas já publicadas</Text>
          <TouchableOpacity onPress={() => navigation.navigate("MinhasReceitas")}>
            <Text style={styles.verTodos}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {receitasPublicadas.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {receitasPublicadas.map((r, i) => (
              <View key={i} style={styles.receitaCard}>
                <Image source={{ uri: r.imagem.startsWith("/") ? `${baseURL}${r.imagem}` : r.imagem }} style={styles.receitaImg} />
                <Text style={styles.receitaNome}>{r.nome}</Text>
                <Text style={styles.favorito}>❤️</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.semReceitas}>
            <Text style={styles.semReceitasTxt}>Nenhuma receita publicada ainda</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.buttonDanger} onPress={handleLogout}>
        <Text style={styles.buttonDangerText}>Encerrar sessão</Text>
      </TouchableOpacity>

      <BottomNav navigation={navigation} active="Perfil" isLoggedIn={usuario !== null} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 20 },
  perfilInfo: { alignItems: "center", justifyContent: "center", marginBottom: 30, position: "relative" },
  perfilFoto: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: "#ff6a00", backgroundColor: "#f0f0f0" },
  perfilNome: { fontSize: 22, fontWeight: "600", marginTop: 10 },
  configBtn: { position: "absolute", top: -5, right: -5 },
  configIcon: { fontSize: 28, color: "#ff6a00" },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  receitaCard: { width: 150, backgroundColor: "#fafafa", borderRadius: 12, marginRight: 15, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3, alignItems: "center" },
  receitaImg: { width: "100%", height: 100, borderRadius: 12 },
  receitaNome: { fontSize: 14, marginVertical: 5, textAlign: "center" },
  favorito: { color: "red", fontSize: 18 },
  tituloLinha: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  verTodos: { color: "#ff6a00", fontSize: 14 },
  semReceitas: { alignItems: "center", justifyContent: "center", backgroundColor: "#eee", borderRadius: 10, padding: 30 },
  semReceitasTxt: { fontSize: 16, color: "#333" },
  buttonDanger: { width: 180, height: 60, backgroundColor: "#ff4b5c", borderRadius: 10, alignSelf: "center", justifyContent: "center", alignItems: "center", marginTop: 10 },
  buttonDangerText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});
