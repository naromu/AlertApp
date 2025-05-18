import mqtt from 'mqtt';

// URL de conexión: mqtt://host:puerto
const client  = mqtt.connect('mqtt://192.168.1.9:1883');

client.on('connect', () => {
  console.log('✔️ Conectado al broker MQTT');
  // Suscríbete al topic que necesites
  client.subscribe('sensores/temperatura', { qos: 0 }, (err, granted) => {
    if (err) {
      console.error('❌ Error al suscribirse:', err);
    } else {
      console.log('🔔 Suscripción exitosa:', granted);
    }
  });
});

client.on('message', (topic, message) => {
  // message es un Buffer
  const payload = message.toString();
  console.log(`📥 Mensaje recibido en ${topic}:`, payload);
  // aquí maneja el payload (p.ej. actualizar estado en React)
});

client.on('error', err => {
  console.error('⚠️ Error MQTT:', err);
  client.end();
});

export default client;
