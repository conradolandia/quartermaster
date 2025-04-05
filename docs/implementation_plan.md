# Quartermaster Stage 0 Technical Implementation Plan

## Initial Setup & Development Environment

### 1. Repository Setup

- Create the three core repositories on GitHub:

  ```bash
  # Create and initialize repositories
  mkdir -p quartermaster/{backend,frontend,docs}

  # For each repository
  cd quartermaster/backend
  git init
  git add README.md
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin git@github.com:star-fleet/quartermaster-backend.git
  git push -u origin main

  # Create develop branch
  git checkout -b develop
  git push -u origin develop
  ```

- Set up branch protection rules for `main` and `develop` branches
  - Require pull request reviews before merging
  - Require status checks to pass
  - Restrict who can push to matching branches

### 2. Development Environment Configuration

- Set up Docker Compose for local development:

  ```bash
  # Create docker-compose.yml for backend
  cat > quartermaster/backend/docker-compose.yml << 'EOF'
  version: '3'
  services:
    postgres:
      image: postgres:14
      environment:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: quartermaster
      ports:
        - "5432:5432"
      volumes:
        - postgres-data:/var/lib/postgresql/data

    redis:
      image: redis:alpine
      ports:
        - "6379:6379"

    backend:
      build: .
      depends_on:
        - postgres
        - redis
      ports:
        - "3333:3333"
      volumes:
        - ./:/app
        - /app/node_modules
      environment:
        NODE_ENV: development
        DB_CONNECTION: pg
        DB_HOST: postgres
        DB_USER: postgres
        DB_PASSWORD: postgres
        DB_DATABASE: quartermaster

  volumes:
    postgres-data:
  EOF

  # Create Docker-related files
  cat > quartermaster/backend/Dockerfile << 'EOF'
  FROM node:18-alpine

  WORKDIR /app

  COPY package*.json ./

  RUN npm install

  COPY . .

  EXPOSE 3333

  CMD [ "node", "ace", "serve", "--watch" ]
  EOF
  ```

### 3. Backend Project Initialization

- Initialize AdonisJS project:

  ```bash
  # Create AdonisJS project
  cd quartermaster/backend
  npm init adonis-ts-app@latest .

  # Select: API Server, ESM, with TypeScript

  # Install required dependencies
  npm install @adonisjs/lucid @adonisjs/auth @adonisjs/mail @adonisjs/drive

  # Configure the installed packages
  node ace configure @adonisjs/lucid
  node ace configure @adonisjs/auth
  node ace configure @adonisjs/mail
  node ace configure @adonisjs/drive

  # Install Stripe, QR code and other necessary packages
  npm install stripe qrcode uuid
  npm install -D @types/qrcode @types/uuid
  ```

### 4. Frontend Project Initialization

- Initialize Astro project with Svelte:

  ```bash
  # Create Astro project with Svelte
  cd quartermaster/frontend
  npm create astro@latest .

  # Enable TypeScript, install dependencies
  npm install -D typescript

  # Add Svelte integration
  npx astro add svelte

  # Add Tailwind CSS and shadcn-svelte
  npx astro add tailwind
  npx shadcn-svelte@latest init
  ```

## Database Design & Implementation

### 1. Create Migration Files

- Generate initial migration files:

  ```bash
  cd quartermaster/backend

  # Generate migrations for core tables
  node ace make:migration admin_users
  node ace make:migration launches
  node ace make:migration missions
  node ace make:migration locations
  node ace make:migration jurisdictions
  node ace make:migration boat_providers
  node ace make:migration boats
  node ace make:migration trips
  node ace make:migration trip_boats
  node ace make:migration bookings
  node ace make:migration booking_items
  ```

- Implement schema definitions in the migration files according to the database schema defined in the Stage 0 MVP document

#### Complete Database Schema

```sql
-- Admin Users Table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- Hashed
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locations Table
CREATE TABLE locations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jurisdictions Table
CREATE TABLE jurisdictions (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    sales_tax_rate DECIMAL(5,2) NOT NULL,
    location_id UUID NOT NULL REFERENCES locations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Boat Providers Table
CREATE TABLE boat_providers (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_description TEXT,
    address TEXT,
    jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id),
    map_link VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Boats Table
CREATE TABLE boats (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    provider_id UUID NOT NULL REFERENCES boat_providers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Launches Table
CREATE TABLE launches (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location_id UUID NOT NULL REFERENCES locations(id),
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Missions Table
CREATE TABLE missions (
    id UUID PRIMARY KEY,
    launch_id UUID NOT NULL REFERENCES launches(id),
    name VARCHAR(255) NOT NULL,  -- e.g., "Falcon Heavy - Take 1"
    active BOOLEAN NOT NULL DEFAULT true,  -- Taking reservations
    public BOOLEAN NOT NULL DEFAULT false,  -- Visible without special link
    sales_open_at TIMESTAMP WITH TIME ZONE,
    refund_cutoff_hours INTEGER DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trips Table
CREATE TABLE trips (
    id UUID PRIMARY KEY,
    mission_id UUID NOT NULL REFERENCES missions(id),
    type VARCHAR(50) NOT NULL,  -- "launch_viewing" or "pre_launch"
    active BOOLEAN NOT NULL DEFAULT true,
    check_in_time TIMESTAMP WITH TIME ZONE,
    boarding_time TIMESTAMP WITH TIME ZONE,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trip Boats Table
CREATE TABLE trip_boats (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id),
    boat_id UUID NOT NULL REFERENCES boats(id),
    max_capacity INTEGER,  -- Optional override of boat capacity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trip_id, boat_id)  -- Prevent duplicate assignments
);

-- Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    confirmation_code VARCHAR(50) NOT NULL UNIQUE,
    mission_id UUID NOT NULL REFERENCES missions(id),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_phone VARCHAR(50) NOT NULL,
    billing_address TEXT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL,
    tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_intent_id VARCHAR(255) NOT NULL,  -- Stripe payment intent ID
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Booking Items Table
CREATE TABLE booking_items (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id),
    trip_id UUID REFERENCES trips(id),  -- Optional, only for trip tickets
    boat_id UUID REFERENCES boats(id),  -- Optional, only for trip tickets
    item_type VARCHAR(50) NOT NULL,  -- "adult_ticket", "child_ticket", etc.
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',  -- "active", "refunded", "fulfilled"
    refund_reason VARCHAR(100),  -- "change_in_party_size", "could_not_make_date", "unsatisfied", "other"
    refund_notes TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    attributes JSONB,  -- Type-specific attributes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Create Models

- Generate model files:

  ```bash
  cd quartermaster/backend

  # Generate models
  node ace make:model AdminUser
  node ace make:model Launch
  node ace make:model Mission
  node ace make:model Location
  node ace make:model Jurisdiction
  node ace make:model BoatProvider
  node ace make:model Boat
  node ace make:model Trip
  node ace make:model TripBoat
  node ace make:model Booking
  node ace make:model BookingItem
  ```

- Add relationships, validations, and other model-specific logic

## Core Features Implementation

### 1. Authentication Module

- Implement admin authentication:

  ```bash
  # Create auth controller
  node ace make:controller Auth

  # Create middleware for admin authentication
  node ace make:middleware AdminAuth
  ```

- Set up JWT authentication with AdonisJS Auth

### 2. Booking Module

- Create controllers for the booking process:

  ```bash
  # Generate controllers
  node ace make:controller Booking
  node ace make:controller Launch
  node ace make:controller Trip
  ```

- Implement Stripe integration for payment processing
- Create QR code generation service

### 3. Admin Dashboard

- Create admin-specific controllers:

  ```bash
  # Generate controllers
  node ace make:controller Admin/Dashboard
  node ace make:controller Admin/BookingManagement
  node ace make:controller Admin/ExportData
  ```

- Implement CSV export functionality

## Frontend Components

### 1. Multi-step Booking Form

- Create the booking form components:

  ```bash
  # Create directories structure
  mkdir -p src/components/booking

  # Create form step components
  touch src/components/booking/TripDetails.svelte
  touch src/components/booking/PaymentInfo.svelte
  touch src/components/booking/Confirmation.svelte
  ```

### 2. Admin Dashboard

- Create admin dashboard components:

  ```bash
  # Create directories structure
  mkdir -p src/components/admin

  # Create admin components
  touch src/components/admin/Dashboard.svelte
  touch src/components/admin/BookingList.svelte
  touch src/components/admin/BookingDetails.svelte
  touch src/components/admin/ExportData.svelte
  ```

## Integration Points

### 1. Stripe Integration

- Set up Stripe API keys and webhook handling:
  ```bash
  # Create Stripe service
  mkdir -p app/Services
  touch app/Services/StripeService.ts
  ```

### 2. Email Service Integration

- Configure SendGrid for email notifications:
  ```bash
  # Create email templates
  mkdir -p resources/views/emails
  touch resources/views/emails/booking_confirmation.edge
  ```

### 3. Static Site Integration

- Create API endpoints for the integration with the existing static site:
  ```bash
  # Create controller for URL parameter handling
  node ace make:controller StaticSiteIntegration
  ```

### 4. Mission Configuration Mechanism

For mission configuration via YAML:

```bash
# Create service for YAML configuration handling
mkdir -p app/Services
touch app/Services/MissionConfigService.ts
```

Example YAML structure:

```yaml
launch:
  id: falcon9-123
  name: Falcon 9 CRS-25
  date_time: 2023-07-15T12:30:00Z
  location_id: cape

missions:
  - name: Falcon 9 CRS-25 - Take 1
    active: true
    public: true
    sales_open_at: 2023-06-15T00:00:00Z
    refund_cutoff_hours: 12

    trips:
      - type: launch_viewing
        check_in_time: 2023-07-15T10:00:00Z
        boarding_time: 2023-07-15T10:30:00Z
        departure_time: 2023-07-15T11:00:00Z
        boats:
          - boat_id: endeavour
            max_capacity: 150
          - boat_id: discovery
            max_capacity: 125

      - type: pre_launch
        check_in_time: 2023-07-14T08:00:00Z
        boarding_time: 2023-07-14T08:30:00Z
        departure_time: 2023-07-14T09:00:00Z
        boats:
          - boat_id: endeavour
```

### 5. QR Code Implementation

```bash
# Create QR code service
touch app/Services/QrCodeService.ts

# Create check-in controller
node ace make:controller Admin/CheckInController
```

QR code implementation:

- Content: URL with booking ID parameter
  - Example: `https://admin.star-fleet.tours/check-in?booking=ABC123`
- Context-aware check-in system:
  - Admin interface to select active trip/boat as check-in context
  - Check-in endpoint validates booking against selected context
  - Detailed booking information displayed including:
    - Trip name and time
    - Boat name
    - Passenger count and details
    - Special requests
    - Tip amount
    - Boat statistics (X/Y passengers fulfilled)
  - Admin confirms check-in, updating relevant item status to "fulfilled"
  - Warning shown if passenger has items for different trip/boat than selected

```typescript
// Example admin check-in controller logic
public async setCheckInContext({ request, session, response }) {
  const { tripId, boatId } = request.all()
  session.put('checkInContext', { tripId, boatId })
  return response.redirect().back()
}

public async processCheckIn({ request, session, response }) {
  const { bookingId } = request.all()
  const context = session.get('checkInContext')

  // Fetch booking and validate against context
  // Update item status to "fulfilled" if valid
  // Return appropriate response with booking details
}
```

### 6. Refund Process Implementation

```bash
# Create refund management controller
node ace make:controller Admin/RefundManagement
```

Refund process implementation:

1. Admin views booking details
2. Selects items to mark as refunded
3. Selects refund reason from dropdown:
   - Change in party size
   - Could not make launch date
   - Unsatisfied with experience
   - Other (requires explanation)
4. Enters notes in text field (required if reason is "Other")
5. System updates item status to 'refunded' and sets refunded_at timestamp
6. System calculates total refund amount
7. System automatically processes refund through Stripe API
8. System displays confirmation of successful refund

Database implementation for refund tracking:

```sql
-- Update to booking_items table (included in migration)
CREATE TABLE booking_items (
    -- other fields
    status VARCHAR(50) NOT NULL DEFAULT 'active',  -- "active", "refunded", "fulfilled"
    refund_reason VARCHAR(100),  -- "change_in_party_size", "could_not_make_date", "unsatisfied", "other"
    refund_notes TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    -- other fields
);
```

Stripe API integration for refunds:

```typescript
// Example refund processing in RefundManagementController
public async processRefund({ request, response }) {
  const { bookingId, itemIds, reason, notes } = request.all()

  // Fetch booking and items
  const booking = await Booking.findOrFail(bookingId)
  const items = await BookingItem.query()
    .whereIn('id', itemIds)
    .andWhere('booking_id', bookingId)

  // Calculate refund amount
  const refundAmount = items.reduce((total, item) => {
    return total + (item.price_per_unit * item.quantity)
  }, 0)

  // Process refund through Stripe API
  const stripe = new Stripe(Env.get('STRIPE_SECRET_KEY'))
  const refund = await stripe.refunds.create({
    payment_intent: booking.payment_intent_id,
    amount: Math.round(refundAmount * 100), // Convert to cents
    reason: reason === 'other' ? undefined : 'requested_by_customer'
  })

  // Update items status and refund information
  await Promise.all(items.map(async (item) => {
    item.status = 'refunded'
    item.refund_reason = reason
    item.refund_notes = notes
    item.refunded_at = new Date()
    await item.save()
  }))

  return response.json({
    success: true,
    refundId: refund.id,
    amount: refundAmount
  })
}
```

### 8. Item Status Tracking Implementation

The status field in booking_items provides a flexible way to track different item states:

1. **Status Values**:

   - `active` - Default state, item is valid and usable
   - `refunded` - Item has been refunded, no longer valid
   - `fulfilled` - Item has been fulfilled (ticket checked-in or swag delivered)

2. **Status Transitions**:

   - `active` → `refunded`: When admin processes a refund
   - `active` → `fulfilled`: When admin checks in a passenger or fulfills an item
   - No transition from `fulfilled` or `refunded` to other states in MVP

3. **Status Usage**:
   - Filtering dashboard displays (only show active items)
   - Calculating available inventory
   - Determining if a passenger can check in
   - Generating accurate manifests

This approach allows different items within the same booking to have different statuses, which is more flexible than booking-level status tracking.

### 9. Backup Strategy

```bash
# Create backup script
touch scripts/backup-database.sh
chmod +x scripts/backup-database.sh
```

Backup implementation:

- Quarterly scheduled backups
- Script exports database to SQL file with timestamp
- Verification procedure to test backup integrity
- Documentation for manual backup process before major changes

## Testing Setup

### 1. Set Up Testing Environment

- Configure testing framework:

  ```bash
  cd quartermaster/backend

  # Configure Japa testing
  node ace configure @japa/preset-adonis
  ```

### 2. Write Initial Tests

- Create tests for core functionality:
  ```bash
  # Create test files
  mkdir -p tests/functional
  touch tests/functional/booking.spec.ts
  touch tests/functional/admin_auth.spec.ts
  ```

## CI/CD Setup

### 1. GitHub Actions Workflow

- Create GitHub Actions workflow files:

  ```bash
  # Create GitHub Actions directory
  mkdir -p .github/workflows

  # Create workflow files
  touch .github/workflows/ci.yml
  touch .github/workflows/deploy-dev.yml
  ```

## Development Kickoff Tasks

1. **Week 1 First Tasks**:

   - Repository setup and access for team members
   - Development environment configuration and testing
   - Database schema implementation and review
   - Initial API endpoint structure design

2. **Week 2 Tasks**:

   - Authentication system implementation
   - Basic booking form structure development
   - Stripe sandbox integration
   - Static site integration parameters finalization

3. **First Sprint Targets**:
   - Functional local development environment for all team members
   - Working database connections and migrations
   - Admin login capability
   - Skeleton API for the booking process
   - Integration point with existing site defined and tested

## Project Management Setup

1. Set up issue tracking in GitHub:

   - Create labels for different types of work (feature, bugfix, etc.)
   - Set up project boards for task management
   - Create milestone for Stage 0 MVP

2. Define weekly check-in schedule:

   - Code review sessions
   - Progress tracking meetings
   - Technical debt review

3. Create documentation structure:
   - API documentation
   - Setup instructions
   - Development guidelines

This plan provides the technical foundation for starting Stage 0 of the Quartermaster project, focusing on concrete steps to establish repositories, set up development environments, and begin implementing core features.
