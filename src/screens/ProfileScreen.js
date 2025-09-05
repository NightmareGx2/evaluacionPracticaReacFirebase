import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente ProfileScreen
 * Pantalla para editar la información del perfil del usuario y cambiar contraseña
 */
const ProfileScreen = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' o 'password'
  const [loading, setLoading] = useState(false);
  
  // Estados para información del perfil
  const [profileData, setProfileData] = useState({
    nombre: '',
    tituloUniversitario: '',
    anoGraduacion: '',
  });

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  /**
   * Función para obtener los datos actuales del usuario desde Firestore
   */
  const fetchUserData = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(database, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfileData({
          nombre: data.nombre || '',
          tituloUniversitario: data.tituloUniversitario || '',
          anoGraduacion: data.anoGraduacion || '',
        });
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    }
  };

  /**
   * Función para actualizar información del perfil
   */
  const updateProfileField = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Función para actualizar campos de contraseña
   */
  const updatePasswordField = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Función para validar el formulario de perfil
   */
  const validateProfileForm = () => {
    const { nombre, tituloUniversitario, anoGraduacion } = profileData;

    if (!nombre || !tituloUniversitario || !anoGraduacion) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return false;
    }

    const currentYear = new Date().getFullYear();
    const graduationYear = parseInt(anoGraduacion);
    if (isNaN(graduationYear) || graduationYear < 1950 || graduationYear > currentYear + 10) {
      Alert.alert('Error', 'Por favor ingrese un año de graduación válido');
      return false;
    }

    return true;
  };

  /**
   * Función para validar el formulario de contraseña
   */
  const validatePasswordForm = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor complete todos los campos de contraseña');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las nuevas contraseñas no coinciden');
      return false;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
      return false;
    }

    return true;
  };

  /**
   * Función para actualizar el perfil del usuario
   */
  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;

    setLoading(true);
    try {
      await updateDoc(doc(database, 'users', user.uid), {
        nombre: profileData.nombre,
        tituloUniversitario: profileData.tituloUniversitario,
        anoGraduacion: profileData.anoGraduacion,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para cambiar la contraseña
   */
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      // Reautenticar usuario
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Actualizar contraseña
      await updatePassword(user, passwordData.newPassword);

      // Limpiar formulario
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      let errorMessage = 'Error al cambiar la contraseña';
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'La contraseña actual es incorrecta';
          break;
        case 'auth/weak-password':
          errorMessage = 'La nueva contraseña es muy débil';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Por seguridad, debe cerrar sesión e iniciar sesión nuevamente';
          break;
        default:
          errorMessage = 'Error al actualizar la contraseña. Intente nuevamente';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para cerrar sesión
   */
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
          <Text style={styles.subtitle}>Gestiona tu información personal</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Información del usuario */}
        <View style={styles.userInfo}>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userName}>{profileData.nombre || 'Nombre no disponible'}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              Información Personal
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'password' && styles.activeTab]}
            onPress={() => setActiveTab('password')}
          >
            <Text style={[styles.tabText, activeTab === 'password' && styles.activeTabText]}>
              Cambiar Contraseña
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido del tab activo */}
        {activeTab === 'profile' ? (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre completo:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese su nombre completo"
                value={profileData.nombre}
                onChangeText={(value) => updateProfileField('nombre', value)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Título universitario:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Ingeniero en Sistemas"
                value={profileData.tituloUniversitario}
                onChangeText={(value) => updateProfileField('tituloUniversitario', value)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Año de graduación:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 2020"
                value={profileData.anoGraduacion}
                onChangeText={(value) => updateProfileField('anoGraduacion', value)}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={styles.emailContainer}>
              <Text style={styles.emailLabel}>Correo electrónico:</Text>
              <Text style={styles.emailValue}>{user?.email}</Text>
              <Text style={styles.emailNote}>
                El correo electrónico no se puede modificar
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.updateButton, loading && styles.buttonDisabled]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              <Text style={styles.updateButtonText}>
                {loading ? 'Actualizando...' : 'Actualizar Perfil'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña actual:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingrese su contraseña actual"
                value={passwordData.currentPassword}
                onChangeText={(value) => updatePasswordField('currentPassword', value)}
                secureTextEntry={true}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nueva contraseña:</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                value={passwordData.newPassword}
                onChangeText={(value) => updatePasswordField('newPassword', value)}
                secureTextEntry={true}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar nueva contraseña:</Text>
              <TextInput
                style={styles.input}
                placeholder="Repita la nueva contraseña"
                value={passwordData.confirmPassword}
                onChangeText={(value) => updatePasswordField('confirmPassword', value)}
                secureTextEntry={true}
              />
            </View>

            <View style={styles.passwordNote}>
              <Text style={styles.passwordNoteText}>
                • La contraseña debe tener al menos 6 caracteres{'\n'}
                • Debe ser diferente a la contraseña actual
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.updateButton, loading && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.updateButtonText}>
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    fontSize: 14,
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0288d1',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  emailContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  emailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 5,
  },
  emailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 5,
  },
  emailNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  passwordNote: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  passwordNoteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  updateButton: {
    backgroundColor: '#0288d1',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
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