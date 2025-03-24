import { Consumer, Producer } from "kafkajs";
import { MessageBroker } from "../utils";

export const InitializeBroker = async () => {
    // step 1: create the producer
  const producer = await MessageBroker.connectProducer<Producer>();
  producer.on("producer.connect", async () => {
    console.log("Producer connected successfully!");
  });

  // step 2: create the consumer
  const consumer = await MessageBroker.connectConsumer<Consumer>();
  consumer.on("consumer.connect", async () => {
    console.log("Consumer connected successfully!");
  });

  // step 3: subscribe to the topic OR publish the message
  // keep listing to consumers events
  await MessageBroker.subscribe((message) => {
    console.log("Consumer received the message!");
    console.log("Received message:", message);
  }, "OrderEvents");
};
