import { describe, it, expect } from 'vitest';
import { parseLlmsTxt } from '../src/parser.js';

describe('parseLlmsTxt', () => {
  describe('versioned resources', () => {
    it('parses events section', () => {
      const input = `## Events
- [Order Placed - OrderPlaced - 1.0.0](https://example.com/docs/events/OrderPlaced/1.0.0.mdx) - Event triggered when order is placed`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'event',
        id: 'OrderPlaced',
        name: 'Order Placed',
        version: '1.0.0',
        summary: 'Event triggered when order is placed',
        url: 'https://example.com/docs/events/OrderPlaced/1.0.0.mdx',
      });
    });

    it('parses commands section', () => {
      const input = `## Commands
- [Process Payment - ProcessPayment - 0.0.1](https://example.com/docs/commands/ProcessPayment/0.0.1.mdx) - Command to process payment`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'command',
        id: 'ProcessPayment',
        name: 'Process Payment',
        version: '0.0.1',
        summary: 'Command to process payment',
        url: 'https://example.com/docs/commands/ProcessPayment/0.0.1.mdx',
      });
    });

    it('parses queries section', () => {
      const input = `## Queries
- [Get Order - GetOrder - 1.0.0](https://example.com/docs/queries/GetOrder/1.0.0.mdx) - Query to get order details`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'query',
        id: 'GetOrder',
        name: 'Get Order',
        version: '1.0.0',
        summary: 'Query to get order details',
        url: 'https://example.com/docs/queries/GetOrder/1.0.0.mdx',
      });
    });

    it('parses services section', () => {
      const input = `## Services
- [Payment Service - PaymentService - 1.0.0](https://example.com/docs/services/PaymentService/1.0.0.mdx) - Handles payments`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'service',
        id: 'PaymentService',
        name: 'Payment Service',
        version: '1.0.0',
        summary: 'Handles payments',
        url: 'https://example.com/docs/services/PaymentService/1.0.0.mdx',
      });
    });

    it('parses domains section', () => {
      const input = `## Domains
- [Payment Domain - Payment - 1.0.0](https://example.com/docs/domains/Payment/1.0.0.mdx) - Payment bounded context`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'domain',
        id: 'Payment',
        name: 'Payment Domain',
        version: '1.0.0',
        summary: 'Payment bounded context',
        url: 'https://example.com/docs/domains/Payment/1.0.0.mdx',
      });
    });

    it('parses flows section', () => {
      const input = `## Flows
- [Payment Flow - PaymentFlow - 1.0.0](https://example.com/docs/flows/PaymentFlow/1.0.0.mdx) - Payment process flow`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'flow',
        id: 'PaymentFlow',
        name: 'Payment Flow',
        version: '1.0.0',
        summary: 'Payment process flow',
        url: 'https://example.com/docs/flows/PaymentFlow/1.0.0.mdx',
      });
    });

    it('parses entities section', () => {
      const input = `## Entities
- [Order Entity - Order - 1.0.0](https://example.com/docs/entities/Order/1.0.0.mdx) - Order aggregate root`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'entity',
        id: 'Order',
        name: 'Order Entity',
        version: '1.0.0',
        summary: 'Order aggregate root',
        url: 'https://example.com/docs/entities/Order/1.0.0.mdx',
      });
    });

    it('parses channels section', () => {
      const input = `## Channels
- [Orders Channel - orders.events - 1.0.0](https://example.com/docs/channels/orders.events/1.0.0.mdx) - Kafka topic for orders`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'channel',
        id: 'orders.events',
        name: 'Orders Channel',
        version: '1.0.0',
        summary: 'Kafka topic for orders',
        url: 'https://example.com/docs/channels/orders.events/1.0.0.mdx',
      });
    });

    it('handles resource without summary', () => {
      const input = `## Events
- [Order Placed - OrderPlaced - 1.0.0](https://example.com/docs/events/OrderPlaced/1.0.0.mdx)`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'event',
        id: 'OrderPlaced',
        name: 'Order Placed',
        version: '1.0.0',
        summary: undefined,
        url: 'https://example.com/docs/events/OrderPlaced/1.0.0.mdx',
      });
    });

    it('handles name with hyphens', () => {
      const input = `## Events
- [Order Re-Placed - OrderRePlaced - 1.0.0](https://example.com/docs/events/OrderRePlaced/1.0.0.mdx) - Re-placed order`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'event',
        id: 'OrderRePlaced',
        name: 'Order Re-Placed',
        version: '1.0.0',
        summary: 'Re-placed order',
        url: 'https://example.com/docs/events/OrderRePlaced/1.0.0.mdx',
      });
    });
  });

  describe('non-versioned resources', () => {
    it('parses teams section', () => {
      const input = `## Teams
- [full-stack](https://example.com/docs/teams/full-stack.mdx) - Full Stack Team`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'team',
        id: 'full-stack',
        name: 'Full Stack Team',
        url: 'https://example.com/docs/teams/full-stack.mdx',
      });
    });

    it('parses users section', () => {
      const input = `## Users
- [jdoe](https://example.com/docs/users/jdoe.mdx) - John Doe`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'user',
        id: 'jdoe',
        name: 'John Doe',
        url: 'https://example.com/docs/users/jdoe.mdx',
      });
    });

    it('parses custom docs section', () => {
      const input = `## Custom Docs
- [Getting Started](https://example.com/docs/pages/getting-started.mdx) - Introduction guide`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'doc',
        id: 'Getting Started',
        name: 'Introduction guide',
        url: 'https://example.com/docs/pages/getting-started.mdx',
      });
    });

    it('uses id as name when no description provided', () => {
      const input = `## Teams
- [backend-team](https://example.com/docs/teams/backend-team.mdx)`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'team',
        id: 'backend-team',
        name: 'backend-team',
        url: 'https://example.com/docs/teams/backend-team.mdx',
      });
    });
  });

  describe('multiple sections', () => {
    it('parses multiple sections correctly', () => {
      const input = `## Events
- [Order Placed - OrderPlaced - 1.0.0](https://example.com/docs/events/OrderPlaced/1.0.0.mdx) - Order placed

## Services
- [Order Service - OrderService - 1.0.0](https://example.com/docs/services/OrderService/1.0.0.mdx) - Manages orders

## Teams
- [platform](https://example.com/docs/teams/platform.mdx) - Platform Team`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('event');
      expect(result[1].type).toBe('service');
      expect(result[2].type).toBe('team');
    });

    it('parses multiple resources in same section', () => {
      const input = `## Events
- [Order Placed - OrderPlaced - 1.0.0](https://example.com/docs/events/OrderPlaced/1.0.0.mdx) - Order placed
- [Order Shipped - OrderShipped - 1.0.0](https://example.com/docs/events/OrderShipped/1.0.0.mdx) - Order shipped
- [Order Delivered - OrderDelivered - 1.0.0](https://example.com/docs/events/OrderDelivered/1.0.0.mdx) - Order delivered`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(3);
      expect(result.map((r) => r.id)).toEqual(['OrderPlaced', 'OrderShipped', 'OrderDelivered']);
    });
  });

  describe('edge cases', () => {
    it('returns empty array for empty input', () => {
      const result = parseLlmsTxt('');
      expect(result).toEqual([]);
    });

    it('ignores unknown sections', () => {
      const input = `## Unknown Section
- [Something - Something - 1.0.0](https://example.com/something.mdx) - Unknown`;

      const result = parseLlmsTxt(input);
      expect(result).toEqual([]);
    });

    it('ignores malformed lines', () => {
      const input = `## Events
- This is not a valid line
- [Order Placed - OrderPlaced - 1.0.0](https://example.com/docs/events/OrderPlaced/1.0.0.mdx) - Valid
- Another invalid line`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('OrderPlaced');
    });

    it('ignores lines before first section', () => {
      const input = `# Some Header
Some text here
- [Invalid - Invalid - 1.0.0](https://example.com/invalid.mdx) - Should be ignored

## Events
- [Order Placed - OrderPlaced - 1.0.0](https://example.com/docs/events/OrderPlaced/1.0.0.mdx) - Valid`;

      const result = parseLlmsTxt(input);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('OrderPlaced');
    });

    it('skips versioned resource with less than 3 parts', () => {
      const input = `## Events
- [Only Two Parts - 1.0.0](https://example.com/invalid.mdx) - Invalid format`;

      const result = parseLlmsTxt(input);
      expect(result).toEqual([]);
    });
  });

  describe('realistic full catalog', () => {
    it('parses a complete llms.txt file with all sections', () => {
      const input = `# FlowMart EventCatalog

> Documentation for FlowMart's event-driven architecture

## Events
- [Order Placed - OrderPlaced - 1.0.0](https://demo.eventcatalog.dev/docs/events/OrderPlaced/1.0.0.mdx) - Triggered when a customer places an order
- [Order Confirmed - OrderConfirmed - 1.0.0](https://demo.eventcatalog.dev/docs/events/OrderConfirmed/1.0.0.mdx) - Triggered when an order is confirmed by the system
- [Payment Processed - PaymentProcessed - 2.0.0](https://demo.eventcatalog.dev/docs/events/PaymentProcessed/2.0.0.mdx) - Triggered when payment is successfully processed
- [Payment Failed - PaymentFailed - 1.0.0](https://demo.eventcatalog.dev/docs/events/PaymentFailed/1.0.0.mdx) - Triggered when payment processing fails
- [Inventory Updated - InventoryUpdated - 1.0.0](https://demo.eventcatalog.dev/docs/events/InventoryUpdated/1.0.0.mdx) - Triggered when inventory levels change
- [Shipment Created - ShipmentCreated - 1.0.0](https://demo.eventcatalog.dev/docs/events/ShipmentCreated/1.0.0.mdx) - Triggered when a shipment is created

## Commands
- [Place Order - PlaceOrder - 1.0.0](https://demo.eventcatalog.dev/docs/commands/PlaceOrder/1.0.0.mdx) - Command to place a new order
- [Process Payment - ProcessPayment - 1.0.0](https://demo.eventcatalog.dev/docs/commands/ProcessPayment/1.0.0.mdx) - Command to process a payment
- [Update Inventory - UpdateInventory - 1.0.0](https://demo.eventcatalog.dev/docs/commands/UpdateInventory/1.0.0.mdx) - Command to update inventory levels
- [Create Shipment - CreateShipment - 1.0.0](https://demo.eventcatalog.dev/docs/commands/CreateShipment/1.0.0.mdx) - Command to create a new shipment

## Queries
- [Get Order - GetOrder - 1.0.0](https://demo.eventcatalog.dev/docs/queries/GetOrder/1.0.0.mdx) - Query to retrieve order details
- [Get Inventory - GetInventory - 1.0.0](https://demo.eventcatalog.dev/docs/queries/GetInventory/1.0.0.mdx) - Query to check inventory levels
- [Get Customer - GetCustomer - 1.0.0](https://demo.eventcatalog.dev/docs/queries/GetCustomer/1.0.0.mdx) - Query to retrieve customer information

## Services
- [Order Service - OrderService - 1.0.0](https://demo.eventcatalog.dev/docs/services/OrderService/1.0.0.mdx) - Manages order lifecycle
- [Payment Service - PaymentService - 2.0.0](https://demo.eventcatalog.dev/docs/services/PaymentService/2.0.0.mdx) - Handles payment processing
- [Inventory Service - InventoryService - 1.0.0](https://demo.eventcatalog.dev/docs/services/InventoryService/1.0.0.mdx) - Manages product inventory
- [Shipping Service - ShippingService - 1.0.0](https://demo.eventcatalog.dev/docs/services/ShippingService/1.0.0.mdx) - Handles shipping and delivery
- [Notification Service - NotificationService - 1.0.0](https://demo.eventcatalog.dev/docs/services/NotificationService/1.0.0.mdx) - Sends notifications to customers

## Domains
- [Order Management - OrderManagement - 1.0.0](https://demo.eventcatalog.dev/docs/domains/OrderManagement/1.0.0.mdx) - Order management bounded context
- [Payment - Payment - 1.0.0](https://demo.eventcatalog.dev/docs/domains/Payment/1.0.0.mdx) - Payment processing bounded context
- [Fulfillment - Fulfillment - 1.0.0](https://demo.eventcatalog.dev/docs/domains/Fulfillment/1.0.0.mdx) - Order fulfillment bounded context

## Flows
- [Order to Delivery - OrderToDelivery - 1.0.0](https://demo.eventcatalog.dev/docs/flows/OrderToDelivery/1.0.0.mdx) - Complete flow from order placement to delivery
- [Payment Processing - PaymentProcessing - 1.0.0](https://demo.eventcatalog.dev/docs/flows/PaymentProcessing/1.0.0.mdx) - Payment processing workflow

## Entities
- [Order - Order - 1.0.0](https://demo.eventcatalog.dev/docs/entities/Order/1.0.0.mdx) - Order aggregate root
- [Customer - Customer - 1.0.0](https://demo.eventcatalog.dev/docs/entities/Customer/1.0.0.mdx) - Customer entity
- [Product - Product - 1.0.0](https://demo.eventcatalog.dev/docs/entities/Product/1.0.0.mdx) - Product entity

## Channels
- [orders.events - orders.events - 1.0.0](https://demo.eventcatalog.dev/docs/channels/orders.events/1.0.0.mdx) - Kafka topic for order events
- [payments.events - payments.events - 1.0.0](https://demo.eventcatalog.dev/docs/channels/payments.events/1.0.0.mdx) - Kafka topic for payment events

## Teams
- [platform](https://demo.eventcatalog.dev/docs/teams/platform.mdx) - Platform Engineering Team
- [orders](https://demo.eventcatalog.dev/docs/teams/orders.mdx) - Orders Team
- [payments](https://demo.eventcatalog.dev/docs/teams/payments.mdx) - Payments Team
- [fulfillment](https://demo.eventcatalog.dev/docs/teams/fulfillment.mdx) - Fulfillment Team

## Users
- [jdoe](https://demo.eventcatalog.dev/docs/users/jdoe.mdx) - John Doe
- [asmith](https://demo.eventcatalog.dev/docs/users/asmith.mdx) - Alice Smith
- [bjohnson](https://demo.eventcatalog.dev/docs/users/bjohnson.mdx) - Bob Johnson

## Custom Docs
- [Getting Started](https://demo.eventcatalog.dev/docs/pages/getting-started.mdx) - Introduction to FlowMart architecture
- [Architecture Overview](https://demo.eventcatalog.dev/docs/pages/architecture.mdx) - High-level architecture documentation
- [API Guidelines](https://demo.eventcatalog.dev/docs/pages/api-guidelines.mdx) - API design guidelines`;

      const result = parseLlmsTxt(input);

      // Count by type
      const events = result.filter((r) => r.type === 'event');
      const commands = result.filter((r) => r.type === 'command');
      const queries = result.filter((r) => r.type === 'query');
      const services = result.filter((r) => r.type === 'service');
      const domains = result.filter((r) => r.type === 'domain');
      const flows = result.filter((r) => r.type === 'flow');
      const entities = result.filter((r) => r.type === 'entity');
      const channels = result.filter((r) => r.type === 'channel');
      const teams = result.filter((r) => r.type === 'team');
      const users = result.filter((r) => r.type === 'user');
      const docs = result.filter((r) => r.type === 'doc');

      // Verify counts
      expect(events).toHaveLength(6);
      expect(commands).toHaveLength(4);
      expect(queries).toHaveLength(3);
      expect(services).toHaveLength(5);
      expect(domains).toHaveLength(3);
      expect(flows).toHaveLength(2);
      expect(entities).toHaveLength(3);
      expect(channels).toHaveLength(2);
      expect(teams).toHaveLength(4);
      expect(users).toHaveLength(3);
      expect(docs).toHaveLength(3);

      // Total resources
      expect(result).toHaveLength(38);

      // Verify specific resources
      expect(events[0]).toEqual({
        type: 'event',
        id: 'OrderPlaced',
        name: 'Order Placed',
        version: '1.0.0',
        summary: 'Triggered when a customer places an order',
        url: 'https://demo.eventcatalog.dev/docs/events/OrderPlaced/1.0.0.mdx',
      });

      expect(services[1]).toEqual({
        type: 'service',
        id: 'PaymentService',
        name: 'Payment Service',
        version: '2.0.0',
        summary: 'Handles payment processing',
        url: 'https://demo.eventcatalog.dev/docs/services/PaymentService/2.0.0.mdx',
      });

      expect(teams[0]).toEqual({
        type: 'team',
        id: 'platform',
        name: 'Platform Engineering Team',
        url: 'https://demo.eventcatalog.dev/docs/teams/platform.mdx',
      });

      expect(users[1]).toEqual({
        type: 'user',
        id: 'asmith',
        name: 'Alice Smith',
        url: 'https://demo.eventcatalog.dev/docs/users/asmith.mdx',
      });

      expect(docs[2]).toEqual({
        type: 'doc',
        id: 'API Guidelines',
        name: 'API design guidelines',
        url: 'https://demo.eventcatalog.dev/docs/pages/api-guidelines.mdx',
      });
    });
  });
});
