import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

// Importar screens existentes
import Home from '../screens/Home';
import Add from '../screens/Add';

// Importar nuevas screens para autenticación
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Importar contexto de autenticación
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Navegador de tabs para usuarios autenticados
 * Incluye las pantallas principales de la aplicación
 */
const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#0288d1',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#e1e5e9',
                    paddingBottom: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false,
            }}
        >
            <Tab.Screen 
                name="HomeTab" 
                component={HomeStackNavigator}
                options={{ 
                    title: 'Productos',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>🏠</Text>
                    ),
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ 
                    title: 'Mi Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>👤</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

/**
 * Navegador Stack para la sección Home (mantiene la funcionalidad existente)
 */
const HomeStackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="Home" 
                component={Home} 
                options={{ title: 'Mis Productos' }} 
            />
            <Stack.Screen 
                name="Add" 
                component={Add} 
                options={{
                    presentation: 'modal', 
                    title: 'Agregar Producto'
                }}
            />
        </Stack.Navigator>
    );
};

/**
 * Componente de navegación principal que maneja autenticación
 */
const AppNavigator = () => {
    const { user, loading } = useAuth();

    // Mostrar splash screen mientras se verifica la autenticación
    if (loading) {
        return <SplashScreen />;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                // Usuario autenticado - Mostrar pantallas principales
                <Stack.Screen name="MainApp" component={MainTabNavigator} />
            ) : (
                // Usuario no autenticado - Mostrar pantallas de autenticación
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    );
};

/**
 * Componente raíz de navegación que incluye el proveedor de autenticación
 */
const Navigation = () => {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
};

export default Navigation;