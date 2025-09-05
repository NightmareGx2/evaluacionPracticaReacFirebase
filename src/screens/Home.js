import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { database } from '../config/firebase'; // Importa la configuración de la base de datos de Firebase
import { collection, onSnapshot, orderBy, query, doc, getDoc } from 'firebase/firestore'; // Importa funciones de Firestore para consultas en tiempo real
import CardProductos from '../components/CardProductos'; // Importa el componente de tarjeta de producto
import { useAuth } from '../contexts/AuthContext'; // Importa el contexto de autenticación

// Definición del componente principal Home
const Home = ({ navigation }) => {
    // Definición del estado local para almacenar los productos
    const [productos, setProductos] = useState([]);
    // Estado para almacenar información del usuario
    const [userData, setUserData] = useState(null);
    // Obtener usuario del contexto de autenticación
    const { user } = useAuth();

    /**
     * Función para obtener los datos del usuario desde Firestore
     */
    const fetchUserData = async () => {
        if (!user) return;

        try {
            const userDoc = await getDoc(doc(database, 'users', user.uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data());
            } else {
                console.log('No se encontraron datos del usuario');
            }
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
        }
    };

    // useEffect se ejecuta cuando el componente se monta
    useEffect(() => {
        // Define una consulta a la colección 'productos' en Firestore, ordenada por el campo 'creado' en orden descendente
        const q = query(collection(database, 'productos'), orderBy('creado', 'desc'));
        
        // Escucha cambios en la consulta de Firestore en tiempo real
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const docs = [];
            querySnapshot.forEach((doc) => {
                // Empuja cada documento con su ID a la lista de docs
                docs.push({ id: doc.id, ...doc.data() });
            });
            // Actualiza el estado de productos con los datos recibidos
            setProductos(docs);
        });

        // Obtener datos del usuario
        fetchUserData();

        // Limpieza de la suscripción al desmontar el componente
        return () => unsubscribe();
    }, [user]);

    // Función para navegar a la pantalla 'Add'
    const goToAdd = () => { 
        navigation.navigate('Add');
    }

    // Función que renderiza cada item de la lista
    const renderItem = ({ item }) => (
        <CardProductos
            id={item.id}
            nombre={item.nombre}
            precio={item.precio}
            vendido={item.vendido}
            imagen={item.imagen}
        />
    );

    // Renderiza la interfaz del componente Home
    return (
        <View style={styles.container}>
            {/* Header con información del usuario */}
            <View style={styles.header}>
                <Text style={styles.welcomeText}>
                    ¡Bienvenido, {userData?.nombre || user?.email || 'Usuario'}!
                </Text>
                <Text style={styles.storeTitle}>MiTienda - Productos Disponibles</Text>
            </View>

            {/* Muestra la lista de productos si hay elementos, de lo contrario muestra un mensaje */}
            {
                productos.length !== 0 ?
                <FlatList
                    data={productos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
                : 
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.Subtitle}>No hay productos disponibles</Text>
                    <Text style={styles.emptySubtext}>Agrega tu primer producto para comenzar</Text>
                </View>
            }

            {/* Botón para navegar a la pantalla de agregar productos */}
            <TouchableOpacity
                style={styles.Button}
                onPress={goToAdd}>
                <Text style={styles.ButtonText}>+ Agregar Producto</Text>
            </TouchableOpacity>
        </View>
    );
};

// Exporta el componente Home como predeterminado
export default Home;

// Estilos para el componente Home
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FEFEFE',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        backgroundColor: '#0288d1',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
        textAlign: 'center',
    },
    storeTitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 20,
    },
    Subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#ff9800'
    },
    emptySubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    Button: {
        backgroundColor: '#0288d1',
        paddingVertical: 18,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    ButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    list: {
        flexGrow: 1,
        paddingBottom: 20,
    },
});