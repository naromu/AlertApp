// mqttClient.tsx
import mqtt from 'mqtt';

const host = 'broker.hivemq.com';
const port = 8000;
const MQTT_TOPIC = 'alertapp/test';

const client = mqtt.connect(`ws://${host}:${port}/mqtt`);

export { client, MQTT_TOPIC };
