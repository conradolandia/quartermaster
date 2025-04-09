# Quartermaster Backend Operations Guide

This document provides guidance on common backend operations for maintaining and developing the Quartermaster booking system.

## Database Operations

### Viewing Database Tables and Entries

AdonisJS provides several commands for database management:

```bash
# List all migrations and their status
node ace migration:status

# Run database migrations
node ace migration:run

# Rollback migrations
node ace migration:rollback

# Reset all migrations (rollback all)
node ace migration:reset

# Refresh migrations (rollback all and migrate again)
node ace migration:refresh

# Drop all tables and re-migrate
node ace migration:fresh

# Run database seeders
node ace db:seed

# Truncate all tables
node ace db:truncate

# Wipe database (drop all tables)
node ace db:wipe
```

### Database REPL

To interact with your database through the AdonisJS REPL:

```bash
# Start the REPL
node ace repl

# In the REPL, use dynamic import (not standard import)
const { default: db } = await import('@adonisjs/lucid/services/db')

# Query a table
const users = await db.from('users').select('*')
console.log(users)

# Exit the REPL with .exit
```

## User Management

### Creating Users

Regular users can be created through:

1. The registration API endpoint: `POST /auth/register`
2. Programmatically using the User model

Sample API request to register a user:

```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password",
    "fullName": "John Doe"
  }'
```

### Creating Admin Users

Admin users can be created through:

1. The admin registration API endpoint: `POST /auth/admin/register`
2. Programmatically using the AdminUser model
3. Using the provided database seeder

Sample API request to register an admin:

```bash
curl -X POST http://localhost:3333/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure_admin_password",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

To create an admin user using the seeder (recommended for initial setup):

```bash
# Run the admin seeder
node ace db:seed --files=./database/seeders/admin_seeder.ts

# This will create an admin with:
# email: admin@starfleet.com
# password: AdminStarfleet123!
```

### User Authentication

Users can authenticate through:

1. The login API endpoint: `POST /auth/login`
2. Admin users login through: `POST /auth/admin/login`

Sample login request:

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password"
  }'
```

The response will include a token that should be used in subsequent authenticated requests:

```bash
curl -X GET http://localhost:3333/api/v1/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## CRUD Operations

### Using Models

The backend uses the Lucid ORM for database operations. Here are examples of CRUD operations using models:

```typescript
import User from '#models/user'
import Booking from '#models/booking'

// Create
const user = await User.create({
  email: 'newuser@example.com',
  password: await hash.make('password'),
  fullName: 'New User',
  role: 'CUSTOMER',
  isActive: true,
})

// Read (find by ID)
const user = await User.find(1)

// Read (query with conditions)
const activeUsers = await User.query().where('isActive', true)

// Read (with relationships)
const userWithBookings = await User.query()
  .where('id', 1)
  .preload('bookings')
  .first()

// Update
const user = await User.find(1)
if (user) {
  user.fullName = 'Updated Name'
  await user.save()
}

// Delete
const user = await User.find(1)
if (user) {
  await user.delete()
}
```

### API Endpoints

The system provides the following API endpoints for various operations:

#### Public Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login for users
- `POST /auth/admin/register` - Register a new admin
- `POST /auth/admin/login` - Login for admins
- `GET /api/v1/locations` - List all locations
- `GET /api/v1/locations/:id` - Get location details
- `GET /api/v1/launches` - List all launches
- `GET /api/v1/launches/:id` - Get launch details
- `GET /api/v1/missions` - List all missions
- `GET /api/v1/missions/:id` - Get mission details
- `GET /api/v1/trips` - List all trips
- `GET /api/v1/trips/:id` - Get trip details

#### Authenticated User Endpoints

These endpoints require a user authentication token:

- `GET /api/v1/bookings` - List user's bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `POST /api/v1/bookings` - Create a new booking
- `PUT/PATCH /api/v1/bookings/:id` - Update a booking
- `DELETE /api/v1/bookings/:id` - Delete a booking

#### Admin-Only Endpoints

These endpoints require admin authentication:

- `POST /api/v1/locations` - Create a location
- `PUT /api/v1/locations/:id` - Update a location
- `DELETE /api/v1/locations/:id` - Delete a location
- `POST /api/v1/launches` - Create a launch
- `PUT /api/v1/launches/:id` - Update a launch
- `DELETE /api/v1/launches/:id` - Delete a launch
- `POST /api/v1/missions` - Create a mission
- `PUT /api/v1/missions/:id` - Update a mission
- `DELETE /api/v1/missions/:id` - Delete a mission
- `POST /api/v1/trips` - Create a trip
- `PUT /api/v1/trips/:id` - Update a trip
- `DELETE /api/v1/trips/:id` - Delete a trip

## Development Utilities

### Creating New Components

AdonisJS provides commands to create various components:

```bash
# Create a new controller
node ace make:controller NewController

# Create a new model
node ace make:model NewModel

# Create a new migration
node ace make:migration create_new_table

# Create a new validator
node ace make:validator NewValidator

# Create a new middleware
node ace make:middleware NewMiddleware

# Create a new service
node ace make:service NewService
```

### Server Operations

```bash
# Start the development server with hot reloading
node ace serve --watch

# Build the application for production
node ace build

# Start the production server (after building)
node start
```

## Testing

```bash
# Run tests
node ace test

# Run specific test file
node ace test tests/functional/example.spec.ts
```

## Authentication Flow

1. A user registers through the `/auth/register` endpoint
2. The system creates a user account and returns an access token
3. The user includes this token in the `Authorization` header for subsequent requests
4. For admin authentication, use the admin-specific endpoints (`/auth/admin/register` and `/auth/admin/login`)
5. The system validates the token and permissions for each protected endpoint

## Role-Based Access Control

The system supports two main user types:
- Regular users (customers)
- Admin users (with additional privileges)

Regular users can:
- Register and login
- View public resources
- Manage their own bookings

Admin users can:
- Perform all regular user operations
- Create, update, and delete system resources (locations, missions, launches, trips)
- Access administrative features