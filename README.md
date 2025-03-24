### Order Service

## Overview

The Order Service manages delivery orders for the Commune Drop platform. It serves as the central coordination point between customers, carriers, and other services in the platform.

## Features

- Create and manage delivery orders
- Track order status in real-time
- Cancel or modify existing orders
- Retrieve order history and details
- Coordinate with other services for a complete delivery workflow


## Dependencies

- Auth Service: User authentication and authorization
- Valuation Service: Delivery price calculation
- Carrier Service: Finding and assigning riders
- Location Service: Order and rider tracking
- Payment Service: Processing payments
- Notification Service: Sending status updates


## Technology Stack

- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB
- Message Queue: RabbitMQ/Kafka
- Caching: Redis


## Setup

### Prerequisites

- Node.js v16+
- MongoDB
- Redis


### Quick Start

1. Clone the repository


```shellscript
git clone https://github.com/commune-drop/order-service.git
cd order-service
```

2. Install dependencies


```shellscript
npm install
```

3. Configure environment variables


```shellscript
cp .env.example .env
# Edit .env with your configuration
```

4. Start the service


```shellscript
npm start
```

For development:

```shellscript
npm run dev
```

## Configuration

Key environment variables:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/order-service
AUTH_SERVICE_URL=http://auth-service:3000
VALUATION_SERVICE_URL=http://valuation-service:3004
CARRIER_SERVICE_URL=http://carrier-service:3006
LOCATION_SERVICE_URL=http://location-service:3002
PAYMENT_SERVICE_URL=http://payment-service:3003
NOTIFICATION_SERVICE_URL=http://notification-service:3005
```

## Status Events

The service publishes these events when order status changes:

- `order.created`
- `order.accepted`
- `order.picked_up`
- `order.in_transit`
- `order.delivered`
- `order.cancelled`


## License

MIT
