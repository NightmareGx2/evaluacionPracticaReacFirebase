import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { database } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Componente Add para agregar un nuevo producto (sin soporte de imágenes)
const Add = ({ navigation }) => {
    // Estado inicial del producto (simplificado)
    const [producto, setProducto] = useState({
        nombre: '',
        precio: '',
        vendido: false,
        creado: new Date()
    });

    // Función para navegar a la pantalla de inicio
    const goToHome = () => {
        navigation.goBack();
    };

    // Función para validar el formulario
    const validateForm = () => {
        if (!producto.nombre.trim()) {
            Alert.alert('Error', 'Por favor ingrese un nombre para el producto');
            return false;
        }

        if (!producto.precio.trim()) {
            Alert.alert('Error', 'Por favor ingrese un precio para el producto');
            return false;
        }

        const precio = parseFloat(producto.precio);
        if (isNaN(precio) || precio < 0) {
            Alert.alert('Error', 'Por favor ingrese un precio válido');
            return false;
        }

        return true;
    };

    // Función para agregar el producto a Firestore
    const agregarProducto = async () => {
        if (!validateForm()) return;

        try {
            const productoData = {
                nombre: producto.nombre.trim(),
                precio: parseFloat(producto.precio),
                vendido: false,
                creado: new Date()
            };

            await addDoc(collection(database, 'productos'), productoData);
            console.log('Producto guardado exitosamente');

            Alert.alert('Éxito', 'El producto se agregó correctamente', [
                { text: 'Ok', onPress: goToHome },
            ]);

        } catch (error) {
            console.error('Error al agregar el producto:', error);
            Alert.alert('Error', 'Ocurrió un error al agregar el producto. Por favor, intenta nuevamente.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Agregar Producto</Text>
                <Text style={styles.subtitle}>Complete la información del producto</Text>
            </View>
            
            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nombre del producto:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: Laptop Dell"
                        onChangeText={text => setProducto({ ...producto, nombre: text })}
                        value={producto.nombre}
                        maxLength={50}
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Precio (USD):</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        onChangeText={text => setProducto({ ...producto, precio: text })}
                        value={producto.precio}
                        keyboardType='numeric'
                        maxLength={10}
                    />
                </View>

                <TouchableOpacity style={styles.addButton} onPress={agregarProducto}>
                    <Text style={styles.addButtonText}>✅ Agregar Producto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={goToHome}>
                    <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Add;

// Estilos del componente
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
        paddingTop: 50,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
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
    },
    form: {
        backgroundColor: 'white',
        padding: 25,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    addButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 20,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#f44336',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});