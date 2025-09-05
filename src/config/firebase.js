import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';
import { API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID, test} from '@env';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// DEBUGGING: Verificar que las variables se carguen correctamente
console.log("🔍 DEBUGGING VARIABLES DE ENTORNO:");
console.log("API_KEY:", API_KEY ? `${API_KEY.substring(0, 10)}...` : "❌ UNDEFINED");
console.log("AUTH_DOMAIN:", AUTH_DOMAIN || "❌ UNDEFINED");
console.log("PROJECT_ID:", PROJECT_ID || "❌ UNDEFINED");
console.log("STORAGE_BUCKET:", STORAGE_BUCKET || "❌ UNDEFINED");
console.log("MESSAGING_SENDER_ID:", MESSAGING_SENDER_ID || "❌ UNDEFINED");
console.log("APP_ID:", APP_ID ? `${APP_ID.substring(0, 10)}...` : "❌ UNDEFINED");
console.log("test variable:", test || "❌ UNDEFINED");

// Verificar que TODAS las variables estén definidas
const requiredVars = { API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID };
const missingVars = Object.entries(requiredVars).filter(([key, value]) => !value);

if (missingVars.length > 0) {
  console.error("❌ VARIABLES FALTANTES:", missingVars.map(([key]) => key));
  throw new Error(`Faltan variables de entorno: ${missingVars.map(([key]) => key).join(', ')}`);
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID    
};

console.log("✅ Configuración Firebase cargada correctamente");

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Initialize Firestore con configuración mejorada
let database;
try {
  database = getFirestore(app);
  
  // IMPORTANTE: Habilitar configuración de red persistente
  // Esto ayuda con los errores de WebChannelConnection
  enableNetwork(database).then(() => {
    console.log('✅ Firestore network enabled');
  }).catch((error) => {
    console.log('⚠️ Firestore network already enabled or error:', error.message);
  });
  
  console.log('✅ Firestore initialized correctly');
  
} catch (error) {
  console.error('❌ Firestore initialization failed:', error);
  throw error;
}

// Initialize Firebase Auth
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
  console.log('✅ Firebase Auth initialized correctly');
  
} catch (error) {
  console.error('❌ Firebase Auth initialization failed:', error);
  throw error;
}

// Función mejorada para verificar conectividad
export const checkFirebaseConnection = async () => {
  try {
    console.log('🔄 Verificando conexión con Firebase...');
    
    // Método más confiable para verificar conexión
    const testPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout - Sin respuesta de Firebase'));
      }, 10000); // 10 segundos timeout
      
      // Intentar habilitar la red como prueba de conectividad
      enableNetwork(database)
        .then(() => {
          clearTimeout(timeout);
          console.log('✅ Firebase conectado correctamente');
          resolve(true);
        })
        .catch((error) => {
          clearTimeout(timeout);
          console.error('❌ Error de conexión Firebase:', error);
          resolve(false);
        });
    });
    
    return await testPromise;
    
  } catch (error) {
    console.error('❌ Error verificando conexión:', error);
    return false;
  }
};

// Función para reinicializar conexión de Firestore
export const reinitializeFirestoreConnection = async () => {
  try {
    console.log('🔄 Reinicializando conexión Firestore...');
    
    // Deshabilitar y luego habilitar la red
    await disableNetwork(database);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
    await enableNetwork(database);
    
    console.log('✅ Conexión Firestore reinicializada');
    return true;
  } catch (error) {
    console.error('❌ Error reinicializando conexión:', error);
    return false;
  }
};

// Función para limpiar errores de conexión
export const clearFirestoreCache = async () => {
  try {
    console.log('🔄 Limpiando cache de Firestore...');
    await database.clearPersistence();
    console.log('✅ Cache limpiado');
    return true;
  } catch (error) {
    console.error('❌ Error limpiando cache:', error);
    return false;
  }
};

// Exportamos database y auth
export { database, auth };