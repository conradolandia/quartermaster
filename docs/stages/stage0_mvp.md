# Quartermaster Stage 0: Minimal Viable Product (MVP)

## Overview

Stage 0 focuses on delivering a streamlined booking system that integrates with the existing Star✦Fleet Tours static website. This MVP will enable users to book tickets for upcoming launches, process payments securely, and receive confirmation with digital tickets. The admin interface will provide basic management capabilities for bookings and passenger manifests.

## Timeline

**Duration**: 1-2 months

- Weeks 1-2: Setup & Core Structure
- Weeks 3-5: Booking System & Admin View
- Weeks 6-8: Testing & Refinement

## Core Functionality

### User-Facing Features

#### 1. Booking Form Integration

- Integration with existing static site via URL parameters
- Parameters: launch ID and optional discount code
- Example URL: `https://book.star-fleet.tours/?launch=falcon9-123`
- Single page displays all booking options (launch and pre-launch trips)
- Mobile-first responsive design

#### 2. Booking Process

- **Step 0**: Trip Selection (via existing static site)
- **Step 1**: Trip Details Entry
  - Number of tickets selection
  - Boat selection (if multiple options)
  - Pre-launch trip options (if available)
  - Discount code field
  - Optional tip field with suggested amounts
  - Special requests text area
- **Step 2**: Confirmation and Payment
  - Itemized cost breakdown
  - Payment formula: [Subtotal - Discount] × (1 + Tax Rate) + Tip
  - Personal details collection (name, email, phone)
  - Billing address collection
  - Stripe payment processing
  - Terms and conditions acceptance
- **Step 3**: Confirmation/Ticket Delivery
  - Confirmation page with booking details
  - QR code ticket generation
  - Email confirmation with booking details
  - Persistent URL for accessing booking details

#### 3. Digital Tickets

- QR code ticket accessible via:
  - Confirmation page
  - Email link
  - Booking lookup (confirmation code + last name)
- QR code contains a URL link with booking ID parameter
- Example: `https://admin.star-fleet.tours/check-in?booking=ABC123`
- Admin selects active trip/boat before scanning to establish check-in context
- System validates if passenger has items for the selected trip/boat
- On successful validation, system updates relevant item status to "fulfilled"

### Admin-Facing Features

#### 1. Authentication System

- Secure admin login
- No public user accounts in MVP
- Password reset functionality

#### 2. Dashboard

- Summary statistics:
  - Total bookings
  - Revenue metrics
  - Passenger counts per trip
- Table of all bookings with:
  - Filtering options (date, refund_status, etc.)
  - Basic search functionality
  - Sorting capabilities

#### 3. Booking Management

- View booking details
- Context-aware check-in process:
  - Admin selects active trip/boat to establish check-in context
  - Admin scans QR code or enters booking ID manually
  - System validates booking against selected trip/boat
  - System displays detailed booking information and statistics
  - Admin confirms check-in, updating item status to "fulfilled"
- Simple "mark as refunded" functionality:
  - Select items to mark as refunded
  - Select refund reason from dropdown
  - Enter explanation notes (required for "Other" reason)
  - System automatically processes refund through Stripe API
  - Display confirmation with refund details

#### Refund Implementation Details

- Database tracking using item-level status field and reason dropdown
- Refund reason options:
  - Change in party size
  - Could not make launch date
  - Unsatisfied with experience
  - Other (requires explanation)
- Admin workflow:
  1. View booking details
  2. Click "Process Refund" button
  3. UI shows all items pre-selected
  4. Deselect specific items if needed
  5. Select refund reason from dropdown
  6. Enter explanation notes (required if reason is "Other")
  7. System calculates refund amount based on selections
  8. Admin submits form
  9. System updates item status to "refunded" and sets refunded_at timestamp
  10. System automatically processes refund through Stripe API
  11. System displays confirmation with refund details
- This approach:
  - Provides structured data for reporting
  - Creates a streamlined admin experience
  - Eliminates manual Stripe dashboard work
  - Provides foundation for Phase 1 enhancements

#### 4. CSV Export

- Export passenger manifest data to CSV
- Filterable by trip/mission
- Standard fields: name, email, phone, ticket quantity, boat

#### 5. Email Notifications

- Simple email confirmation for new bookings
- Basic email templates for booking confirmations

#### 6. Mission Configuration

- Configure trips via YAML file
- Basic trip/mission parameters:
  - Name
  - Date/time
  - Location data
    - Launch site (where the rocket launches)
    - Jurisdiction (where the boat sails from)
  - Mission details
    - Name (e.g., "Take 1", "Take 2")
    - Active status (taking reservations)
    - Public visibility status
    - Sales opening time
    - Refund cutoff hours
  - Trips configuration
    - Launch viewing trips with boat assignments
    - Pre-launch trips with times and boat assignments
  - Ticket pricing

## Technical Implementation

### Backend (AdonisJS)

#### Core Components

1. **Authentication Module**

   - Admin login system
   - JWT token implementation
   - Password management

2. **Booking Module**

   - Booking creation and validation
   - Payment processing integration
   - Confirmation generation
   - QR code creation

3. **Admin Module**

   - Dashboard data aggregation
   - Booking management endpoints
   - CSV export functionality
   - Simple mission/trip management

4. **Email Module**
   - SendGrid integration
   - Basic email templates
   - Transactional email delivery

#### Database Schema (PostgreSQL)

1. **Admin Users Table**

   - ID, name, email, password (hashed), role, created_at, updated_at

2. **Launches Table**

   - ID, name, date_time, location_id, summary, created_at, updated_at

3. **Missions Table**

   - ID, launch_id, name, active (taking reservations), public (visible without special link), sales_open_at, refund_cutoff_hours (default 12), created_at, updated_at

4. **Locations Table**

   - ID, name, created_at, updated_at

5. **Jurisdictions Table**

   - ID, name, state, sales_tax_rate, location_id, created_at, updated_at

6. **Boat Providers Table**

   - ID, name, location_description, address, jurisdiction_id, map_link, created_at, updated_at

7. **Boats Table**

   - ID, name, capacity, provider_id, created_at, updated_at

8. **Trips Table**

   - ID, mission_id, type (launch_viewing/pre_launch), active, check_in_time, boarding_time, departure_time, created_at, updated_at

9. **Trip Boats Table**

   - ID, trip_id, boat_id, max_capacity (optional override), created_at, updated_at

10. **Bookings Table**

    - ID, confirmation_code, mission_id, user_name, user_email, user_phone, billing_address, subtotal, discount_amount, tax_amount, tip_amount, total_amount, payment_intent_id, special_requests, created_at, updated_at

11. **Booking Items Table**
    - ID, booking_id, trip_id, boat_id, item_type (adult/child/etc), quantity, price_per_unit, status (active/refunded/fulfilled), refund_notes, refunded_at, attributes (JSONB), created_at, updated_at

### Frontend (Astro + Svelte)

#### Core Components

1. **Booking Form**

   - Multi-step form implementation
   - Real-time validation
   - Responsive design for mobile and desktop
   - Ticket selection interface
   - Integrated Stripe Elements

2. **Confirmation Page**

   - Booking summary display
   - QR code generation
   - Print-friendly layout
   - Save-to-device functionality

3. **Admin Dashboard**

   - Responsive dashboard layout
   - Data visualization components
   - Booking table with filtering
   - CSV export interface

4. **Booking Lookup**
   - Simple form for retrieving booking by confirmation code + name
   - Ticket display and management

#### Design System

1. **Component Library**

   - Shadcn-svelte components with custom styling
   - Consistent color scheme and typography
   - Responsive grid system
   - Form components with validation states

2. **Responsive Design**
   - Mobile-first approach
   - Breakpoints for tablet and desktop
   - Optimized layouts for different device sizes

### Integration Points

1. **Static Site Integration**

   - URL parameter passing
   - Visual consistency with existing site
   - Navigation links between systems

2. **Stripe Integration**

   - Secure payment processing
   - Stripe Elements for card input
   - Webhook handling for payment events

3. **Email Service Integration**
   - SendGrid API implementation
   - HTML email templates
   - Delivery tracking

## Implementation Priorities

1. Core booking form with Stripe integration
2. Confirmation page with QR code functionality
3. Basic admin dashboard with booking table and counts
4. CSV export functionality
5. Simple email confirmations
6. Mission configuration via YAML
7. Simple check-in and refund marking functionality
8. Tip functionality in booking form

## Security Considerations

1. **Data Protection**

   - HTTPS enforcement
   - Secure handling of PII
   - No storage of payment details

2. **Authentication**

   - Secure admin login system
   - Password policies
   - Session management

3. **API Security**

   - Input validation
   - Rate limiting
   - CORS configuration

4. **Stripe Security**
   - Use of Stripe Elements
   - PCI compliance via Stripe
   - Secure webhook handling

## Testing Approach

1. **Unit Testing**

   - Core business logic
   - API endpoints
   - Form validation

2. **Integration Testing**

   - Booking flow
   - Payment processing
   - Email delivery

3. **User Acceptance Testing**
   - Admin dashboard functionality
   - Booking process
   - Mobile compatibility

## Deployment Plan

1. **Infrastructure Setup**

   - VPS configuration
   - Database setup
   - Domain and SSL configuration

2. **Deployment Process**

   - Git-based deployment
   - PM2 process management
   - Database migration

3. **Post-Deployment**
   - Smoke testing
   - Performance monitoring
   - Error tracking via Sentry

## Regular Maintenance

1. **Backup Strategy**
   - Quarterly database backups
   - Manual backups before major changes
   - Simple backup script to export database
   - Backup verification procedure

## Launch Readiness Checklist

1. **Functionality**

   - Complete booking flow works
   - Admin can view and manage bookings
   - CSV exports function correctly
   - Emails deliver reliably

2. **Performance**

   - Page load under 3 seconds on 4G
   - Booking submission under 5 seconds
   - Admin dashboard loads efficiently

3. **Security**

   - All endpoints properly secured
   - Data transmission encrypted
   - User data protected

4. **Compliance**
   - Basic accessibility standards met
   - Privacy policy implemented
   - Terms of service displayed

## Success Metrics

1. **Technical Metrics**

   - Booking completion rate > 90%
   - System uptime > 99.5%
   - Error rate < 1%

2. **Business Metrics**
   - Successful bookings processed
   - Admin time saved vs. manual process
   - Customer satisfaction with booking experience

## Future Considerations

This MVP establishes the foundation for future phases while providing immediate value. Key considerations for smooth transition to Phase 1:

1. Database design that accommodates future features
2. API structure that allows for expansion
3. Component architecture that supports reuse
4. Clean separation of concerns for maintainability

The MVP focuses on essential functionality while setting up the architecture to support the more advanced features planned for subsequent phases.
