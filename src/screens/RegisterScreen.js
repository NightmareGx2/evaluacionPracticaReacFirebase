import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';

// Componente RegisterScreen
// Pantalla para el registro de nuevos usuarios
const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    tituloUniversitario: '',
    anoGraduacion: '',
  });
  const [loading, setLoading] = useState(false);

  /**
   * Función para actualizar los campos del formulario
   */
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Función para validar el formulario
   */
  const validateForm = () => {
    const { nombre, email, password, confirmPassword, tituloUniversitario, anoGraduacion } = formData;

    if (!nombre || !email || !password || !confirmPassword || !tituloUniversitario || !anoGraduacion) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
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
   * Función para manejar el registro de usuario
   */
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Guardar información adicional en Firestore
      await setDoc(doc(database, 'users', user.uid), {
        nombre: formData.nombre,
        email: formData.email,
        tituloUniversitario: formData.tituloUniversitario,
        anoGraduacion: formData.anoGraduacion,
        createdAt: new Date().toISOString(),
      });

      console.log('Usuario registrado exitosamente');
      Alert.alert('Éxito', 'Usuario registrado correctamente. Bienvenido a MiTienda!');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      let errorMessage = 'Error al registrar usuario';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Ya existe una cuenta con este correo electrónico';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil';
          break;
        default:
          errorMessage = 'Error al crear la cuenta. Intente nuevamente';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.logoText}>🛒</Text>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Complete la información para registrarse</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre completo:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese su nombre completo"
              value={formData.nombre}
              onChangeText={(value) => updateField('nombre', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo electrónico:</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Título universitario:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Ingeniero en Sistemas"
              value={formData.tituloUniversitario}
              onChangeText={(value) => updateField('tituloUniversitario', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Año de graduación:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2020"
              value={formData.anoGraduacion}
              onChangeText={(value) => updateField('anoGraduacion', value)}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña:</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry={true}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar contraseña:</Text>
            <TextInput
              style={styles.input}
              placeholder="Repita su contraseña"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry={true}
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia sesión aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginBottom: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
  },
  backButtonText: {
    color: '#0288d1',
    fontSize: 16,
    fontWeight: '600',
  },
  logoText: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
  registerButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#0288d1',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;