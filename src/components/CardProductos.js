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

// Componente funcional que representa una tarjeta de producto
const CardProductos = ({ id, nombre, precio, vendido }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.nombre}>{nombre}</Text>
            <Text style={styles.precio}>${precio.toFixed(2)}</Text>
            <View style={styles.statusContainer}>
                <Text style={[styles.status, vendido ? styles.vendido : styles.disponible]}>
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
        marginBottom: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#0288d1',
    },
    nombre: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    precio: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#0288d1',
    },
    statusContainer: {
        marginBottom: 15,
    },
    status: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        textAlign: 'center',
        overflow: 'hidden',
    },
    vendido: {
        color: '#dc3545',
        backgroundColor: '#f8d7da',
    },
    disponible: {
        color: '#28a745',
        backgroundColor: '#d4edda',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    updateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 14,
    },
    venderButton: {
        backgroundColor: '#28a745',
    },
    regresarButton: {
        backgroundColor: '#fd7e14',
    },
});

export default CardProductos;