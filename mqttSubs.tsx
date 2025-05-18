import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import mqttClient from './mqttClient';

type SensorData = {
  time: string;
  location: string;
  sensor: string;
  value: number;
};

export default function SensorTemp() {
  const [dataList, setDataList] = useState<SensorData[]>([]);

  useEffect(() => {
    const onMessage = (topic: string, message: Buffer) => {
      if (topic === 'sensores/temperatura') {
        try {
          const json: SensorData = JSON.parse(message.toString());

          setDataList(prev => {
            const newList = [...prev, json];

            // Ordenar por fecha descendente (más reciente arriba)
            newList.sort(
              (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
            );

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

    const renderItem = ({ item }: { item: SensorData }) => {
      const dateObj = new Date(item.time);

      return (
        <View style={styles.card}>
          <Text style={styles.title}>Sensor: {item.sensor}</Text>
          <Text style={styles.value}>Fecha: {dateObj.toLocaleDateString()}</Text>
          <Text style={styles.value}>Hora: {dateObj.toLocaleTimeString()}</Text>
          <Text style={styles.value}>Ubicación: {item.location}</Text>
          <Text style={styles.value}>Valor: {item.value} °C</Text>
        </View>
      );
    };


  return (
    <FlatList
      data={dataList}
      keyExtractor={(item, index) => `${item.time}-${index}`}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<Text>Esperando datos del sensor...</Text>}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
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
  title: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
  },
});
