import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { database } from '../config/firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';

// Función para eliminar un documento de Firestore
const handleDelete = async (id) => {
    try {
        // Se elimina el documento con el id proporcionado de la colección 'productos'
        await deleteDoc(doc(database, 'productos', id));
        console.log('Se eliminó el documento con id: ', id);
    } catch (e) {
        console.error('Error removing document: ', e);
    }
};

// Función para actualizar el estado de 'vendido' de un documento en Firestore
const handleUpdate = async (id, vendido) => {
    try {
        // Se actualiza el campo 'vendido' invirtiendo su valor actual
        await updateDoc(doc(database, 'productos', id), {
            vendido: !vendido
        });
        console.log('Se actualizó el documento con id: ', id);
    } catch (e) {
        console.error('Error updating document: ', e);
    }
};

// Componente funcional que representa una tarjeta de producto (sin imagen)
const CardProductos = ({ id, nombre, precio, vendido }) => {
    return (
        <View style={styles.card}>
            <View style={styles.productInfo}>
                <Text style={styles.nombre}>{nombre}</Text>
                <Text style={styles.precio}>${precio}</Text>
                <Text style={[styles.estado, vendido ? styles.vendido : styles.disponible]}>
                    {vendido ? "Vendido" : "Disponible"}
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(id)}>
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.updateButton, vendido ? styles.regresarButton : styles.venderButton]}
                    onPress={() => handleUpdate(id, vendido)}>
                    <Text style={styles.updateButtonText}>
                        {vendido ? "Devolver" : "Vender"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Estilos del componente
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 20,
        margin: 10,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    productInfo: {
        marginBottom: 15,
    },
    nombre: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    precio: {
        fontSize: 18,
        marginBottom: 8,
        color: '#0288d1',
        fontWeight: '600',
    },
    estado: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        overflow: 'hidden',
    },
    vendido: {
        backgroundColor: '#ffebee',
        color: '#d32f2f',
    },
    disponible: {
        backgroundColor: '#e8f5e8',
        color: '#388e3c',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        gap: 10,
    },
    deleteButton: {
        backgroundColor: '#f44336',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        maxWidth: '45%',
    },
    deleteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 14,
    },
    updateButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        maxWidth: '45%',
    },
    updateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 14,
    },
    venderButton: {
        backgroundColor: '#4caf50',
    },
    regresarButton: {
        backgroundColor: '#ff9800',
    },
});

export default CardProductos;