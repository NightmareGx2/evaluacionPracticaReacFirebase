import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, database, checkFirebaseConnection, reinitializeFirestoreConnection } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [error, setError] = useState(null);
  
  // Estados para información del perfil
  const [profileData, setProfileData] = useState({
    nombre: '',
    tituloUniversitario: '',
    anoGraduacion: '',
  });

  /**
   * Función para verificar y establecer conexión
   */
  const establishConnection = async () => {
    console.log('🔄 Estableciendo conexión...');
    setConnectionStatus('connecting');
    setError(null);
    
    try {
      // Primero verificar conexión
      const isConnected = await checkFirebaseConnection();
      
      if (!isConnected) {
        console.log('🔄 Primera conexión falló, reinicializando...');
        const reconnected = await reinitializeFirestoreConnection();
        
        if (!reconnected) {
          throw new Error('No se pudo establecer conexión con Firebase');
        }
      }
      
      setConnectionStatus('connected');
      console.log('✅ Conexión establecida exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error estableciendo conexión:', error);
      setConnectionStatus('failed');
      setError(error.message);
      return false;
    }
  };

  /**
   * Función para crear documento de usuario si no existe
   */
  const ensureUserDocument = async () => {
    try {
      console.log('🔄 Verificando documento de usuario...');
      
      const userDocRef = doc(database, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log('📝 Documento no existe, creando...');
        
        await setDoc(userDocRef, {
          nombre: '',
          tituloUniversitario: '',
          anoGraduacion: '',
          email: user.email,
          createdAt: new Date().toISOString(),
        });
        
        console.log('✅ Documento de usuario creado');
      }
      
      return userDoc;
    } catch (error) {
      console.error('❌ Error verificando/creando documento:', error);
      throw error;
    }
  };

  /**
   * Función para cargar datos del usuario
   */
  const fetchUserData = async () => {
    if (!user) {
      setInitialLoading(false);
      return;
    }

    console.log('🔄 Cargando datos del usuario:', user.uid);
    
    try {
      // 1. Establecer conexión
      const connected = await establishConnection();
      if (!connected) {
        throw new Error('Sin conexión a Firebase');
      }
      
      // 2. Verificar/crear documento
      const userDoc = await ensureUserDocument();
      
      // 3. Cargar datos
      const freshDoc = await getDoc(doc(database, 'users', user.uid));
      
      if (freshDoc.exists()) {
        const data = freshDoc.data();
        console.log('✅ Datos cargados:', data);
        
        setProfileData({
          nombre: data.nombre || '',
          tituloUniversitario: data.tituloUniversitario || '',
          anoGraduacion: data.anoGraduacion || '',
        });
        
        setError(null);
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setInitialLoading(false);
    }
  };

  /**
   * Función para actualizar perfil
   */
  const handleUpdateProfile = async () => {
    const { nombre, tituloUniversitario, anoGraduacion } = profileData;

    if (!nombre || !tituloUniversitario || !anoGraduacion) {
      Alert.alert('Error', 'Complete todos los campos');
      return;
    }

    const currentYear = new Date().getFullYear();
    const graduationYear = parseInt(anoGraduacion);
    if (isNaN(graduationYear) || graduationYear < 1950 || graduationYear > currentYear + 10) {
      Alert.alert('Error', 'Año de graduación inválido');
      return;
    }

    setLoading(true);
    
    try {
      // Verificar conexión antes de actualizar
      const connected = await establishConnection();
      if (!connected) {
        throw new Error('Sin conexión para actualizar');
      }

      const userDocRef = doc(database, 'users', user.uid);
      await updateDoc(userDocRef, {
        nombre,
        tituloUniversitario,
        anoGraduacion,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setError(null);
      
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      Alert.alert('Error', `No se pudo actualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para cerrar sesión
   */
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión');
    }
  };

  /**
   * Función para reintentar conexión
   */
  const retryConnection = () => {
    setInitialLoading(true);
    fetchUserData();
  };

  useEffect(() => {
    console.log('🚀 ProfileScreen iniciado');
    fetchUserData();
  }, [user]);

  // Pantalla de carga
  if (initialLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0288d1" />
        <Text style={styles.statusText}>
          {connectionStatus === 'checking' && 'Verificando conexión...'}
          {connectionStatus === 'connecting' && 'Conectando con Firebase...'}
          {connectionStatus === 'connected' && 'Cargando datos...'}
          {connectionStatus === 'failed' && 'Error de conexión'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Estado de conexión */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Estado: {connectionStatus === 'connected' ? '🟢 Conectado' : '🔴 Desconectado'}
        </Text>
        <Text style={styles.userText}>Usuario: {user?.email}</Text>
      </View>

      {/* Errores */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryConnection}>
            <Text style={styles.retryText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Formulario */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre completo:</Text>
          <TextInput
            style={styles.input}
            placeholder="Su nombre completo"
            value={profileData.nombre}
            onChangeText={(value) => setProfileData(prev => ({...prev, nombre: value}))}
            editable={connectionStatus === 'connected'}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Título universitario:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Ingeniero en Sistemas"
            value={profileData.tituloUniversitario}
            onChangeText={(value) => setProfileData(prev => ({...prev, tituloUniversitario: value}))}
            editable={connectionStatus === 'connected'}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Año de graduación:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 2020"
            value={profileData.anoGraduacion}
            onChangeText={(value) => setProfileData(prev => ({...prev, anoGraduacion: value}))}
            keyboardType="numeric"
            maxLength={4}
            editable={connectionStatus === 'connected'}
          />
        </View>

        <TouchableOpacity
          style={[styles.updateButton, (loading || connectionStatus !== 'connected') && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={loading || connectionStatus !== 'connected'}
        >
          <Text style={styles.updateButtonText}>
            {loading ? 'Actualizando...' : 'Actualizar Perfil'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  userText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  errorText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: '#856404',
    fontWeight: '600',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  updateButton: {
    backgroundColor: '#0288d1',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;