# Payment Service

A microservice for handling payment processing using Stripe, designed to work within a Kubernetes environment.

## Overview

The Payment Service is responsible for managing customer payment information, processing payments, and handling refunds. It integrates with Stripe for payment processing and communicates with the Order Service to update order statuses after successful payments.

## Features

- Customer management (create/retrieve customers)
- Payment method management (add/list/delete payment methods)
- Payment processing (create payment intents)
- Refund processing
- Integration with Order Service for status updates

## Tech Stack

- Node.js with Express
- TypeScript
- MongoDB for data storage
- Stripe API for payment processing
- Docker for containerization
- Kubernetes for orchestration

## API Endpoints

### Customer Management

- `GET /payment/customer/:email` - Get a customer by email
- `POST /payment/customer` - Create a new customer

### Payment Method Management

- `GET /payment/payment-methods/:customerId` - List all payment methods for a customer
- `POST /payment/payment-method` - Add a new payment method to a customer
- `POST /payment/payment-method-details` - Add a payment method with card details
- `DELETE /payment/payment-method` - Delete a payment method

### Payment Processing

- `POST /payment/payment-intent` - Create a payment intent and charge the customer
- `POST /payment/refund` - Process a refund for a specific payment intent

## Environment Variables

The service requires the following environment variables:

- `PORT` - Port on which the service runs
- `MONGODB_URI` - MongoDB connection string
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `ORDER_SERVICE_URL` - URL of the Order Service
- `NODE_ENV` - Environment (development, production)

## Data Models

### Customer

Stores information about customers and their Stripe IDs.

### Payment Method

Stores information about saved payment methods.

### Payment

Stores information about processed payments and refunds.

## Deployment

The service is containerized using Docker and deployed on Kubernetes. The Kubernetes configuration files are available in the `k8s` directory.

## API Documentation

API documentation is available via Swagger UI at `/api-docs` when the service is running.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the service: `npm start`
5. For development: `npm run dev`

## Testing

Run tests with: `npm test`
