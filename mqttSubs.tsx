import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import mqttClient from './mqttClient';

export default function SensorTemp() {
  const [temp, setTemp] = useState<string | null>(null);

  useEffect(() => {
    interface MessageEvent {
      topic: string;
      message: Buffer;
    }

    const onMessage = (topic: string, message: Buffer) => {
      if (topic === 'sensores/temperatura') {
        setTemp(message.toString());
      }
    };
    mqttClient.on('message', onMessage);
    return () => {
      mqttClient.off('message', onMessage);
    };
  }, []);

  return (
    <View>
      <Text>Temperatura actual:</Text>
      <Text style={{ fontSize: 24 }}>
        {temp !== null ? `${temp} °C` : 'Esperando datos...'}
      </Text>
    </View>
  );
}
