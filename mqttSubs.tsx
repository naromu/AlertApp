import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mqttClient from './mqttClient';

import { Button } from 'react-native';

type SensorData = {
  time: string;
  location: string;
  sensor: string;
  value: number;
  isNew?: boolean; 
};

const STORAGE_KEY = 'sensorDataList';

export default function SensorTemp() {
  const [dataList, setDataList] = useState<SensorData[]>([]);

  // Cargar datos guardados
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: SensorData[] = JSON.parse(stored);
          // Marcar como no nuevas (vienen de disco)
          const initialized = parsed.map(item => ({ ...item, isNew: false }));
          setDataList(initialized);
        }
      } catch (error) {
        console.error('❌ Error cargando datos guardados:', error);
      }
    };

    loadStoredData();
  }, []);

  const clearAllNotifications = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setDataList([]);
    } catch (error) {
      console.error('❌ Error al eliminar notificaciones:', error);
    }
  };



  // Nuevos mensajes por MQTT
  useEffect(() => {
    const onMessage = (topic: string, message: Buffer) => {
      if (topic === 'sensores/temperatura') {
        try {
          const json: SensorData = JSON.parse(message.toString());
          const newEntry = { ...json, isNew: true };

          setDataList(prev => {
            const newList = [...prev, newEntry].sort((a, b) => {
              if (a.isNew && !b.isNew) return -1;
              if (!a.isNew && b.isNew) return 1;
              return new Date(b.time).getTime() - new Date(a.time).getTime();
            });

            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList))
              .catch(err => console.error('❌ Error guardando en AsyncStorage:', err));

            return newList;
          });
        } catch (error) {
          console.error('❌ Error parsing JSON:', error);
        }
      }
    };

    mqttClient.on('message', onMessage);
    return () => {
      mqttClient.off('message', onMessage);
    };
  }, []);

  const handlePress = (index: number) => {
    setDataList(prev => {
      const updated = [...prev];
      updated[index].isNew = false;

      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(err =>
        console.error('❌ Error actualizando AsyncStorage:', err)
      );

      return updated;
    });
  };

  const renderItem = ({ item, index }: { item: SensorData; index: number }) => {
    const dateObj = new Date(item.time);

    return (
      <Pressable onPress={() => handlePress(index)}>


        <View style={styles.card}>
          {item.isNew && <Text style={styles.newAlert}>¡Nueva alerta!</Text>}
          <Text style={styles.title}>Sensor: {item.sensor}</Text>
          <Text style={styles.value}>Fecha: {dateObj.toLocaleDateString()}</Text>
          <Text style={styles.value}>Hora: {dateObj.toLocaleTimeString()}</Text>
          <Text style={styles.value}>Ubicación: {item.location}</Text>
          <Text style={styles.value}>Valor: {item.value} °C</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.actions}>
      {dataList.length > 0 && (
        <View style={styles.buttonContainer}>
          <Button 
            title="Eliminar notificaciones" 
            onPress={clearAllNotifications} 
          />
        </View>
      )}
      <FlatList
        data={dataList}
        keyExtractor={(item, index) => `${item.time}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Esperando alertas del servidor...
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  newAlert: {
    color: '#d00',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
  },
  actions: {
    flex: 1,  // Asegura que el contenedor tome todo el espacio disponible
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  listContent: {
    flexGrow: 1,  // Permite que la lista crezca
    paddingBottom: 150,  // Añade más espacio al final
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingTop: 16,
  },
});
