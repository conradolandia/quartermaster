# Quartermaster - System Overview

> **Note**: This document provides a high-level overview of the Quartermaster booking system. For detailed technical specifications, see [Data Model](./data_model.md), [Implementation Plan](./implementation_plan.md), and [Deployment Strategy](./deployment_strategy.md).

[![hackmd-github-sync-badge](https://hackmd.io/-B0VvS3zRiqPyoHvU7UHWg/badge)](https://hackmd.io/-B0VvS3zRiqPyoHvU7UHWg)

We're a collective of space fans organizing educational trips and launch experiences, and our continuing mission is to inspire kids and adults alike to dream big, work hard and keep looking toward the stars.

It all started with a simple idea: what if a group of space fans chartered a boat to get the best view possible of the first Falcon Heavy launch and landing? Since those humble beginnings with a few dozen enthusiasts, interest in the concept has taken off, with hundreds of kids, adults and families from all around the world going out with us, as well as attracting media attention and interest from other local organizations.

Thanks to the help of designers, programmers, web developers and more who've gone out on previous launches and want to help share the experience with others, we launched the Star✦Fleet Tours organization to help coordinate more viewing and educational opportunities, make it easier for interested folks to find out more and reserve their tickets, improve the quality of the overall experience and make our operation sustainable going forward to serve more people and launches than ever.

What hasn't changed, however, is our core mission: to share the wonder and excitement of spaceflight with people of all ages, backgrounds and previous launch experiences. Whether you're a veteran space buff who's seen hundreds of flights or a newcomer watching your very first; whether you've lived in the area all your life or are a traveler visiting from half a world away; and whether you're getting an up-close view of the many historic pads at the Cape and an exclusive peek at the rocket on the pad on our pre-launch tour, or watching the future take flight with the launch itself, we want to make sure you have with the experience of a lifetime—every time.

## Trips Overview

Each mission represents Star Fleet's organized viewing opportunity for a specific launch attempt. A mission contains one or more trips: typically a launch viewing trip and optional pre-launch trips.

Each trip has scheduled times: one for the boat's departure and another determined by the mission's launch time.

- Cancellation Policy for Registered Users:
  - Before the boat departs (or before a designated safety threshold), cancellations are eligible for a refund.
  - Once the boat has sailed or the safety threshold has been crossed, refunds cannot be issued because payment for the boat has already been processed.
- Mission Launch Cancellations:
  - If the mission launch is cancelled after the safety threshold, refunds are not provided, as these cancellations are beyond our control.
  - In such cases, passengers will receive perks such as guided visits to historical sites and local marine habitats, plus a ~30% discount on a future trip of their choice.

The old bookings website had the following text. A similar text may be presented to the user at booking time, so we should think about possible edits to this disclaimer:

> Tickets are valid for any day the mission launches, except if a scrub occurs after we leave port one hour prior to launch time (we offer a 25% discount on further attempts). Launch dates may change without warning; if you cannot make it, we may be able to offer a limited number of refunds for tickets or merchandise up to five business days in advance of the launch date, at our sole discretion. If you have any questions, please contact us before purchasing. Thanks!

**Note:** This text is only a reference from the old system. The policies and language will need to be updated for the new system to ensure clarity and accuracy.

## Entity Hierarchy and Relationships

The core hierarchy and relationship between key entities is:

1. **Launches**

   - Represents the actual rocket launch event (e.g., "SpaceX Starship Flight 9")
   - Each Launch belongs to a Location (launch site)
   - The external entity that Star Fleet missions revolve around
   - Example: "Falcon Heavy STP-2 Launch"

2. **Missions**

   - Star Fleet's organized viewing opportunity for a specific launch attempt
   - If a launch scrubs (cancels after boats go out), a new Mission is created for the next attempt
   - Identified with names like "Falcon Heavy - Take 1", "Falcon Heavy - Take 2"
   - Each Mission references a specific Launch
   - Each Mission has its own active status, public visibility, and sales opening time
   - The central organizing entity for Star Fleet operations

3. **Trips**

   - A specific boat excursion within a Mission
   - Two main types:
     - Launch Viewing Trip: To watch the actual rocket launch
     - Pre-Launch Trip: To view the rocket on the pad before launch
   - Pre-launch trips often have multiple departure times on the same day
   - Each Trip references a specific Mission (not a Launch directly)
   - Trips have specific details like boat assignments, departure times, capacity

4. **Bookings**

   - A customer's reservation record
   - Contains items for one specific mission (not across multiple mission attempts)
   - Each Booking is for a specific Mission (not across multiple Mission attempts)
   - Contains payment information, passenger details, status
   - Links to specific items through BookingItems

5. **BookingItems**
   - Individual line items within a Booking
   - May reference specific Trips and Boats
   - Includes quantity, price, and status information
   - Uses the status field to track refunds and fulfillment

This hierarchy ensures that:

- Multiple Mission attempts for the same Launch can be properly tracked
- Trips are correctly associated with specific Mission attempts
- Bookings are made at the Mission level, with items potentially spanning multiple Trips
- Refund and fulfillment status can be tracked at the individual item level

# Description of requirements

We will need a new bookings website, with an administrative interface for different roles (admin, future: boat liaison, captain) so users can buy tickets to scheduled trips (and cancel them), and admins can create and administer trips and passengers, issue refunds and cancel trips sending email notifications about the changes in trips to the users.

We require it to be secure, fast and realiable, and also easy to maintain.

Basically, we know the backend will require a database to preserve data, and produce a REST API in JSON format. This API will be used by the website interface to display, create and update data dynamically.

For the MVP, we'll create a simple booking form that integrates with our existing static site. In future phases, we'll develop a public front-end with no login required, where an anonymous user can see upcoming trips in a calendar-type view.

After clicking on a trip, the user would be presented with a detailed view, maybe in a slide in panel. In this detailed view, the user would be presented with a button to buy a trip. Buying a trip would require entering passenger details but not creating an account (guest checkout only for MVP).

We will use Stripe for payments and refunds.

When a user buys a trip, the details of the transaction need to be sent to certain admin users.

## Tech stack

After evaluating several technology options and considering our project requirements, timeline constraints, and team composition, we have selected the following tech stack:

### Backend: AdonisJS (TypeScript)

[AdonisJS](https://adonisjs.com/) is a fully-featured web framework for Node.js with a focus on developer ergonomics and speed.

We've chosen AdonisJS for the following reasons:

- **Speed of Development**: Built-in features accelerate MVP development
- **Full-Featured Framework**: Includes authentication, validation, ORM, and email services
- **Convention over Configuration**: Reduces decision fatigue and standardizes code structure
- **Strong TypeScript Support**: Provides type safety while maintaining developer productivity
- **Excellent Documentation**: Comprehensive guides and examples for rapid learning
- **Built-in CLI**: Powerful tooling for scaffolding components and database operations

AdonisJS provides several key features that align with our project needs:

- **[Lucid ORM](https://docs.adonisjs.com/guides/database/introduction)**: Built-in ORM for working with PostgreSQL
- **[Authentication System](https://docs.adonisjs.com/guides/auth/introduction)**: Robust authentication with multiple guard options
- **[Validator](https://docs.adonisjs.com/guides/validator/introduction)**: Comprehensive validation system for form inputs
- **[Mailer](https://docs.adonisjs.com/guides/mailer)**: Email service for sending booking confirmations
- **[Shield](https://docs.adonisjs.com/guides/security/web-security)**: Security middleware for protection against common web attacks
- **[Drive](https://docs.adonisjs.com/guides/drive)**: File storage abstraction for storing manifest files

### Database: PostgreSQL

PostgreSQL is our chosen database for its reliability, features, and excellent support in AdonisJS:

- JSON capabilities for flexible data storage
- Robust transaction support for payment processing
- Excellent performance and scalability
- Free and open-source

### Frontend

We will create an [Astro](https://docs.astro.build/en/concepts/why-astro/) website with [Svelte 5](https://svelte.dev/) as JS framework, and [Shadcn-svelte](https://www.shadcn-svelte.com/) as component library ([Tailwind CSS](https://tailwindcss.com/) is implied).

**Key components:**

- Astro for static site generation and page routing
- Svelte 5 for reactive UI components
- Shadcn-svelte for accessible, customizable UI components
- Tailwind CSS for styling
- TypeScript for type safety

### Additional Infrastructure

- **Authentication**: AdonisJS Auth with JWT tokens for admin users only (MVP)

- **API Documentation**: Swagger via [AdonisJS Swagger](https://github.com/reg2005/adonis-swagger) provider

- **Email Service**: [SendGrid](https://sendgrid.com/) through AdonisJS Mailer
  **Why SendGrid over alternatives like Mailchimp:**

  - SendGrid specializes in transactional emails (booking confirmations, receipts, updates) while Mailchimp is primarily for marketing campaigns
  - Better deliverability rates for transactional messages like booking confirmations
  - More developer-friendly API for programmatic sending from our application
  - No monthly subscriber limits that could impact a transactional system
  - Simple integration with AdonisJS via official providers
  - More cost-effective for our specific use case (per-email pricing vs. subscriber-based)

- **File Storage**: AdonisJS Drive with local filesystem driver
  **VPS storage considerations:**

  - Configure AdonisJS Drive to use the local filesystem for storing manifests and QR codes
  - Implement a regular backup system for the file storage directory
  - Set up a separate partition/directory for file storage to prevent application storage from impacting system performance
  - Configure appropriate permissions for the storage directory
  - Implement disk space monitoring to prevent storage issues
  - For future scalability, the same Drive abstraction would allow migration to S3 or other cloud storage if needed

- **Deployment**: Simple deployment via Git with [PM2](https://pm2.keymetrics.io/) process manager

  - Well-suited for VPS hosting environment
  - Enables zero-downtime deployments
  - Handles automatic restarts if the application crashes

- **Monitoring**: [Sentry](https://sentry.io/) for error tracking and simple server monitoring

### Development Tools

- Code quality: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)
- Testing: [Japa](https://japa.dev/) (AdonisJS testing framework)
- API testing: [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/)
- Database management: [pgAdmin](https://www.pgadmin.org/) or similar

## Functionality requirements for the front-end (public-facing website)

### MVP (Phase 0)

- Integration with existing static site via parameters to select mission/trip
- Booking form for selected trips
- Confirmation page with booking details and QR code
- Simple static display of trip details

### Future Phases

- Display a public (no login required) calendar of upcoming launches and trips
- Show the location and details of each launch
  - Show details of the rocket
  - Show details of the launch site
  - Sell tickets with Stripe

## Functionality requirements for the front-end (passenger-facing)

### MVP (Phase 0)

- Access booking details via confirmation code + last name or confirmation link
- View ticket information and QR code

### Future Phases

- Rebook on subsequent launches with applied discount (for mission cancellations)
- User accounts with login
- Request refund with reason dropdown and explanation field (Phase 1)

## Functionality requirements for the back-end (admin)

### MVP (Phase 0)

- Simple dashboard showing:
  - Table of all bookings
  - Passenger counts per trip
  - Revenue metrics
- Basic CSV export of passenger manifest data
- Simple email notifications to users
- Basic search for bookings by confirmation code, name, email
- Configure trips via YAML file
- Simple buttons to mark passengers as "fulfilled" or "refunded" (without full workflow)
- Basic tip functionality in booking form (dollar amount added at checkout)

### QR Code Implementation

For the MVP, QR codes generated for tickets will:

- Contain a URL link with booking ID parameter
- Example: `https://admin.star-fleet.tours/check-in?booking=ABC123`
- Allow for context-aware check-in by admin users
  - Admin selects active trip/boat before scanning
  - System validates booking against selected trip/boat
  - Warning shown if mismatch occurs
- Update relevant item status to "fulfilled" upon successful check-in
- Serve as electronic tickets that can be displayed on mobile devices
- Function without requiring passenger login or accounts

### Future Phases

- Enhanced dashboard with visualization
- Launch-specific views with passenger tables
- Manage launches and trips (create, edit, cancel)
- Process refund requests (approve, modify refund amount) (Phase 1)
- QR code check-in system for passengers (Phase 1)
- Generate manifests in HTML format (later: PDF and CSV)
- Rescheduling tools for cancelled missions

## Additional Roles (Post-MVP)

### Boat Liaison Role

- Check in passengers at dock
- View limited passenger data for their assigned boat
- Distribute pre-ordered swag
- Update passengers on trip status

### Boat Captain Role

- View and print manifest for their specific boat
- Indicate availability for future launches
- Update trip status information

## Data Model Specifications

### Launch Data

**Required Fields for MVP:**

- Launch name (e.g., `SpaceX Starship Flight 9`)
- Launch ID (auto-generated or manual)
- Launch timestamp (with precision level)
- Summary (short description)
- Launch site ID

**Optional Fields (Future Phases):**

- Precision level (how accurately the launch time is known)
- TBD flag (for launches with uncertain timing)
- NET flag (No Earlier Than indicator)
- Launch window close time
- Rocket type (Falcon 9, Atlas V, Starship, etc.)
- Payload information
- Customer details

### Mission Data

**Required Fields for MVP:**

- ID
- Launch ID (connection to associated launch)
- Name (e.g., "Falcon Heavy - Take 1")
- Timestamp to open public ticket sales
- Active flag (taking reservations)
- Public flag (visible without special link)
- Refund cutoff hours (default: 12)

**Optional Fields (Future Phases):**

- Mission cancellation status
- Mission summary descriptions
- Swag availability information

### Launch Pad Data

**Required Fields for MVP:**

- ID
- Name
- Location ID
  **Optional Fields (Future Phases):**
- Coordinates
- Compatible rockets

### Location Data

**Required Fields for MVP:**

- ID (e.g., `cape`, `starbase`)
- Name
- State (e.g. Florida, Texas)
- State code (e.g. FL, TX)

**Optional Fields (Future Phases):**

- Other location-specific information

### Jurisdiction Data

- ID (`port_canaveral`, `spi`)
- Name (e.g. Port Canaveral, South Padre Island)
- Sales Tax Rate (e.g. 6.25%, 8%)
- Location ID

### Trip Data

**Required Fields for MVP:**

- ID
- Mission ID (connection to associated mission)
- Type (launch_viewing or pre_launch)
- Active flag (taking reservations)
- Check-in, boarding, departure times
- Available boats with capacity (boat IDs with optional max passenger override)

**Optional Fields (Future Phases):**

- Trip cancellation status
- Trip summary descriptions
- Additional scheduling options

### Boat Provider Data

**Required Fields for MVP:**

- ID
- Name
- Location description
- Address
- Jurisdiction ID
- Map link

### Boat Data

- ID
- Name
- Maximum passenger capacity
- Provider ID

**Optional Fields (Future Phases):**

- Boat images
- Amenities information (restrooms, food, decks)
- Boat descriptions
- Accessibility features

### Passenger Data

**Required Fields for MVP:**

- User ID (derived from email)
- Name
- Email
- Phone
- Billing address
- Check-in status

**Optional Fields (Future Phases):**

- User account connection
- Preference settings
- Past trip history

### Booking Data

**Required Fields for MVP:**

- Mission ID (what mission this booking is for)
- Ticket quantities
- Boat selections
- Payment details:
  - Discount codes (if applicable)
  - Tips (non-negative values only, capped at 0 minimum)
  - Special requests
  - Total charges and tax
- Status tracking for individual items:
  - `active` - Default state
  - `refunded` - Item has been refunded
  - `fulfilled` - Item has been fulfilled (checked-in or delivered)
- Basic refund status (for MVP)

**Optional Fields (Future Phases):**

- Swag orders with quantities
- Pre-launch trip selections
- Detailed refund information:
  - Refund reason
  - Requested amount
  - Approved amount
  - Detailed status tracking

### Form Flow for User Booking

#### Phase 1: Trip Details Entry (Required)

- Select Mission (launch attempt)
- Number of tickets/passengers for Launch Viewing Trip
- Boat selection (if multiple options)
- Pre-launch trip options (if available)
  - Number of tickets
  - Date/time selection
  - Boat selection
- Discount code application (if applicable)
- Optional tip (with validation to ensure non-negative values)
- Special requests or needs

#### Phase 2: Confirmation and Payment (Required)

- Itemized cost breakdown:
  - Subtotal
  - Discount (if applicable)
  - Tip (if provided)
  - Sales tax (based on location)
  - Total due
- Personal details:
  - Name
  - Email (with option to receive future launch updates)
  - Phone
- Billing address:
  - Country
  - Address lines
  - City
  - State/province
  - Postal code
- Payment processing via Stripe Elements
- Terms and conditions acceptance checkbox

#### Phase 3: Confirmation/Ticket Delivery (Required)

- Persistent URL with booking access information
- Confirmation message
- QR code ticket
- Booking details summary
- Boat information with check-in/boarding/departure times

## Booking Process Flow

### Step 0: Mission Selection

- User selects launch/mission from existing static site (for MVP)
- In future phases: selection from calendar view

### Step 1: Trip Details Entry

- Number of tickets for Launch Viewing Trip
- Boat selection (if multiple options)
- Pre-launch trip options (if available)
- Optional add-ons (future: merchandise)
- Special requests or needs
- Discount code application
- Optional tip (with validation to ensure non-negative values)

### Step 2: Confirmation and Payment

- Itemized cost breakdown (subtotal, discount, tip, tax, total)
  - Formula: [Subtotal - Discount] × (1 + Tax Rate) + Tip
- Personal details entry
  - Name
  - Email
  - Phone
  - Billing address
- Payment processing via Stripe
- Terms and conditions acceptance

### Step 3: Confirmation/Ticket Delivery

- Confirmation page with booking details
- QR code ticket generation
- Email confirmation with persistent URL for booking access
- No account creation required for MVP

### Integration with Existing Static Site (Phase 0)

- Technical approach:
  - Booking form will be accessible via direct URL with query parameters
  - Parameters will include: launch ID and optional discount code
  - Example URL: `https://book.star-fleet.tours/?launch=falcon9-123`
  - Discount codes can enable early-bird access and/or apply discounts
  - Codes are mission-specific to prevent exploitation
- Data passing:
  - Launch ID passed via URL
  - Application will determine relevant active Mission for this Launch
  - No sensitive data transmitted between systems
  - Single page shows all booking options for the mission (launch and pre-launch trips)
- User flow:
  - User browses existing static site
  - "Book Now" buttons link to the booking application with launch ID
  - Booking application shows active Mission for that Launch
  - Confirmation page includes links to static site resources (ToC, FAQ)
  - Site logo links to static site home
- Security considerations:
  - URL parameters validated server-side
  - No PII transmitted via URL
  - CORS policies to restrict allowed origins
  - Rate limiting to prevent abuse
- Domain considerations:
  - Primary domain: `star-fleet.tours` (historical)
  - `starfleet.tours` available as DNS redirect
  - Future consideration: Make `starfleet.tours` the canonical domain

## Refund and Cancellation System

### Phase 0 MVP Refund Implementation

For the MVP, refund implementation includes:

1. **Admin interface** for processing refunds
2. **Line item status tracking** in the database:
   - Status field with "active", "refunded", or "fulfilled" values
   - Refund reason dropdown with standard options:
     - Change in party size
     - Could not make launch date
     - Unsatisfied with experience
     - Other (requires explanation)
   - Refund notes field for additional details (required for "Other" reason)
   - Refunded_at timestamp to track when the refund was processed
3. **Automatic refund processing** through Stripe API:
   - System calculates appropriate refund amount
   - Passes payment_intent_id, amount, and reason to Stripe
   - Updates database with refund status
   - Displays confirmation to admin
4. **Streamlined refund workflow**:
   - Admin selects items to mark as refunded
   - Selects reason from standardized dropdown
   - Enters additional notes when required
   - System automatically processes the refund
   - Confirmation displayed with refund details

### Phase 1+ Implementation

#### Refund Form Implementation (Phase 1)

- Line item-based refund selection with quantity fields
  - Users select specific items and quantities to refund
  - Quantity field maxes out at quantity purchased
  - Default state
    - For passengers-initiated: all items set to a refund quantity of 0
    - For admin-initiated: all items set to full refund quantity
  - "Refund All/None" buttons to quickly set all quantities to 0 or max
- Tip handling:
  - Passenger-initiated refunds
    - Refund 0 for passenger-initiated by default (like the other items)
    - Refund amount can be set manually or all refunded with Refund All
  - Admin-initiated refunds
    - Refund full for admins by default (like other items)
    - Can be unset if other items are/Refund None selected, but refunded automatically if all other items are refunded (cannot be unset in this case)
- Sales tax refund calculation:
  - Automatically calculated proportionally to subtotal refunded
- Refund reason options:
  - Change in party size
  - Could not make launch date
  - Unsatisfied with experience
  - Other (with required explanation)
- **Enhanced refund flexibility** (for edge cases):
  - Option to refund a flat amount or percentage of transaction
  - Useful for "unsatisfied with experience" scenarios
  - Does not require changing item status in database
  - Handles partial compensation situations
  - Helps prevent potential chargebacks

#### Passenger-Initiated Refunds

- Passengers can request refunds at any time via booking page
- Refund request includes:
  - Line item selection with quantities to refund
  - Reason dropdown menu
  - Explanation text field (required)
- System calculates appropriate refund amount based on selections

#### Admin Refund Processing

- Review and approve/deny refund requests
- View itemized refund request details
- One-click approval option for straightforward cases
- Admin can also initiate refunds with:
  - Same form fields as user-initiated refunds
  - Additional "Trip cancelled" reason option
  - All items selected by default with max quantities
  - Explanation optional for certain reason categories
  - Immediate processing upon form submission
- Process refunds through Stripe
- Option to offer future trip credit instead of refund (post-MVP)

#### Launch Cancellation Handling

- If before safety threshold: Full refund option
- If after boat departure: No automatic refunds
- Optional ~30% discount on rebooking for next launch attempt
- Option for passengers to rebook from their confirmation page
- Phase 1 or 2: Master cancellation system
  - Per-mission cancellation button with dialog
  - Line item selection for partial cancellations (specific trips, boats, times)
  - Cancellation reason required (Weather, Boat Not Available, etc.)
  - Automatic email notifications to affected passengers
  - System updates to prevent further bookings for cancelled items

#### Multi-Payment Handling (Phase 2+)

- Support for refunding reservations with multiple payments
- Allocation of refunds across payment transactions
- Processing newest payments first, then proceeding to older payments
- Ensuring refund amounts don't exceed original payment amounts

##### Multi-Payment Data Model and Processing

- Payment records will be stored with:
  - Reference to the booking/reservation they apply to
  - Timestamp of payment
  - Payment amount
  - Stripe payment intent ID
  - Items purchased in this payment transaction
  - Status (paid, refunded, partially refunded)
- Refund allocation algorithm:
  - Start with the most recent payment
  - Refund line items that were purchased in that payment
  - If a line item spans multiple payments, refund from newest to oldest
  - Track refund status per line item and per payment
  - Maintain running totals to ensure no overpayment
- User experience considerations:
  - Users don't need to know about payment allocation details
  - Admins see payment history with refund status per transaction
  - System handles allocation automatically
- Database tracking:
  - Each refund transaction references the original payment(s)
  - Partial refund tracking at the line item level
  - Running totals of refunded and refundable amounts

### Refund UI Implementation

The refund form will include an itemized table similar to:

```
Item to refund      Qty to Refund   Rate    Total Refund
--------------------------------------------------------
Launch Viewing      [ 2 ] / 3       $100     $200 / $300
Pre-Launch Trip     [ 0 ] / 2        $80       $0 / $160
Swag                [ 3 ] / 3        $20      $60 /  $60
Subtotal              5   / 7                $260 / $520
--------------------------------------------------------
Tax                                  10%      $26 /  $52
Tip                  [10] / 40                $10 /  $40
Total Refunded                               $296 / $612
```

## Enhanced Features (Post-MVP)

### Automated Waitlist System

- Implement automated waitlist for fully booked trips
- Allow users to join waitlist with pre-authorized payment
- Automatically notify and process payments when spots become available
- Provide waitlist position transparency to users
- Create admin tools to manage and override waitlist operations

### Weather Integration

- Integrate weather forecasting for launch sites
- Display marine-specific conditions (wave height, water temperature)
- Provide weather information to both users and administrators
- Include forecasts in trip details
- Add weather alert notifications for potentially affected trips

### Review & Rating System

- Implement post-trip reviews for completed trips
- Include dual-component structure:
  - Public reviews (star rating + comments)
  - Private feedback to operations team
- Add optional post-trip tipping feature
- Create analytics dashboard for review sentiment and trends
- Allow administrators to respond to reviews

## Security Considerations

- Implement comprehensive authentication system with MFA for admin accounts
- Create role-based access control with granular permissions
- Ensure data protection through encryption at rest and in transit
- Implement API security best practices (rate limiting, input validation, etc.)
- Follow Stripe security best practices for payment processing
- Establish regular security scanning and monitoring
- Create secure backup strategy and disaster recovery plan

## Development Timeline

### Phase 0: Minimal MVP (1-2 months)

#### Weeks 1-2: Setup & Core Structure

- Project structure and repository setup
- Database schema definition for essential tables (Launch, Mission, Trip, Booking)
- Basic API endpoints for bookings
- Admin authentication system
- Frontend booking form design (mobile-first)

#### Weeks 3-5: Booking System & Admin View

- Implement Stripe payment integration
- Create booking form with validation
- Build confirmation page with QR code
- Develop basic admin dashboard showing:
  - Table of all bookings
  - Passenger counts per trip
  - Revenue metrics
- Implement CSV export of booking data
- Create simple email confirmation system

#### Weeks 6-8: Testing & Refinement

- Testing and bug fixes
- Deployment to production
- Integration with existing static site
- Documentation for admins
- Simple configuration system for mission details (JSON-based)

### Phase 0 MVP Features Priority

1. Booking form with Stripe integration (including tip functionality)
2. Confirmation page with persistent URL and QR code
3. Basic admin dashboard with booking table and counts
4. CSV export functionality
5. Simple email confirmations
6. Mission/trip configuration via YAML
7. Simple "mark as fulfilled" and "mark as refunded" admin functionality

### Phase 1: Core Features (Additional 2-3 months)

- Proper calendar view for trips
- Enhanced admin dashboard
- QR code check-in system
- Customer-facing refund request system with line item selection
- Full refund processing workflow from admin panel
- Self-service cancellation within policy timeframes
- Proper database models for all entities
- Admin interface for creating/editing launches and trips
- Mission template system with pre-filled details
  - Template-based approach (Cape/Starbase => Pad => Vehicle => Payload)
  - Variables like `$LAUNCH_DATETIME`, `$MISSION_NUMBER`
  - Pre-fill from existing missions
  - Dedicated "scrub" button to re-create mission with updated timing
- Mission change tracking system
  - Event logging for mission updates
  - Optional suppression for minor changes
  - Automatic notification generation
  - Timeline display of changes on passenger-facing pages
- Basic waitlist functionality
- HTML manifest generation
- Improved email notifications

#### Mission Template System Specification

- Template data model:
  - Template name and description
  - Location/vehicle/pad combinations
  - Default text content with variable placeholders
  - Default timing parameters (boarding, departure relative to launch)
  - Default pricing structure
- Template variables:
  - Mission-specific: `$LAUNCH_DATETIME`, `$MISSION_NUMBER`, `$VEHICLE_NAME`, etc.
  - Location-specific: `$VIEWING_DISTANCE`, `$LANDMARK_REFERENCES`, etc.
  - Operator-specific: `$BOAT_NAME`, `$DEPARTURE_LOCATION`, etc.
- Template management interface:
  - CRUD operations for templates
  - Template library with filtering options
  - Preview functionality with sample data
  - Clone/modify existing templates
- Template application workflow:
  - Admin selects template for new mission
  - System pre-fills all fields from template
  - Admin provides mission-specific details
  - System performs variable substitution
  - Admin can override any pre-filled values
- Scrub/reschedule functionality:
  - "Scrub" button copies all mission details to new date
  - Maintains all configuration except date/time
  - Option to automatically notify booked passengers
  - Ability to apply mission-wide discount for rebooking

#### Mission Change Tracking System

- Change event categories:
  - Mission timing changes (date, time, window)
  - Vessel/boat changes
  - Logistics changes (departure location, check-in time)
  - Price changes
  - General information updates
- Significance classification:
  - Major: Changes affecting passenger attendance decisions (date, time, location)
  - Moderate: Changes affecting logistics (different boat, boarding process)
  - Minor: Informational updates, spelling corrections, clarifications
- Data model for change events:
  - Timestamp of change
  - Admin who made the change
  - Category and significance
  - Old and new values
  - Description/reason for change
  - Notification status (suppressed, pending, sent)
- User-facing presentation:
  - Timeline view on reservation page showing changes in reverse chronological order
  - Highlighting of major changes
  - Filtering options to focus on specific change types
  - Automatic email notifications for major changes
- Implementation approach:
  - Detect changes automatically by comparing old/new values
  - Allow admins to add explanatory notes
  - Provide option to suppress notification for minor changes
  - Batch processing of notifications to prevent email overload

### Phase 2: Enhanced Features (Additional 2 months)

- Optional user accounts with login
- Advanced manifest generation (HTML, PDF, CSV)
- Batch email notifications
- Swag purchase options
- Weather integration (basic)
- More detailed trip management
- Master cancellation system for trips and launches
- Multi-payment refund handling
- Ability to order more tickets or merchandise for existing bookings
- Mailchimp/SendGrid integration for email announcement lists

### Phase 3: Advanced Features (Additional 1-2 months)

- Additional user roles (boat liaison, captain)
- Automated waitlist with payment pre-authorization
- Comprehensive weather integration
- Post-trip review and rating system
- Tipping functionality
- Yearly membership model with:
  - Per-launch and merchandise discounts
  - Access to Discord with insider updates
  - Priority/early bird booking access
- Simple support ticketing system for passenger inquiries
- Comprehensive analytics dashboard
- Advanced reporting functions
- Automated rescheduling tools
- Performance optimization and security hardening

### Tip Functionality Implementation

- User experience:
  - Presented as an optional dollar amount field during checkout
  - Clear indication that tips are optional
  - Suggested tip amounts (e.g., $5, $10, $20)
  - Custom tip amount option
  - Brief explanation of how tips support the tour operators
- Technical implementation:
  - Stored as a separate line item in the booking record
  - Included in the total charge processed through Stripe
  - Validated to ensure non-negative values only
  - Capped at reasonable maximum (e.g., 50% of booking subtotal)
- Reporting and analytics:
  - Tip totals tracked separately in financial reports
  - Average tip amount per booking analytics
  - Tip frequency reporting (percentage of bookings with tips)
- Refund handling:
  - As defined in refund policy section
  - Fully refunded for complete booking cancellations
  - Optional for partial refunds with user/admin control
- Future enhancements:
  - Percentage-based tip options (Phase 2+)
  - Post-trip tipping capability (Phase 3)
  - Tip allocation features for multiple crew members (Phase 3)

### Handling Bookings and Items

1. **Item Status Tracking**

   - Individual booking items use a status field with values:
     - `active` - Default state, item is valid
     - `refunded` - Item has been refunded
     - `fulfilled` - Item has been fulfilled (ticket checked-in or swag delivered)
   - This approach allows different items within the same booking to have different statuses

2. **Supporting Separate Transactions**

   - For the MVP, focus on single-transaction bookings
   - Design the database to support future multiple transactions by including a `payment_intent_id` in the `Bookings` table
   - Defer implementation of "add-on" purchases until a future phase

3. **Item Tracking Implementation**
   - Use a single BookingItems table for all item types
   - Use the JSONB attributes field to store type-specific details
   - Implement application-level validation for the attribute structure

## Additional Considerations

### Legal and Compliance Elements

- **Privacy Policy Requirements**:

  - Standard privacy policy will be adopted and linked within the website UI and from Stripe
  - Only admins will have access to personal information (contact/address info)
  - Must address data collection, storage, usage, and sharing practices
  - Required for integration with Stripe and other third-party services

- **Payment Information Handling**:

  - No credit card/payment information will be stored on our servers
  - Will use Stripe Elements to ensure payment data never touches our systems
  - This approach avoids PCI-DSS compliance burden while maintaining security
  - Will store only reference tokens provided by Stripe for refund processing

- **Terms of Service**:

  - Existing terms cover booking conditions and cancellation policies
  - Will expand to include more detailed liability limitations
  - Will formalize customer behavior expectations and safety requirements
  - Need explicit consent mechanism during checkout (checkbox with summary and links to policies)
  - Booking/cancellation conditions may vary per launch based on captain negotiations

- **Data Retention Policies**:

  - For users with accounts: data stored indefinitely as a benefit of account creation
  - For guest checkouts: consider scrubbing sensitive data (address, phone, email) after one year
  - Note that Stripe retains customer data indefinitely regardless of our policies
  - Create procedures for handling data deletion requests:
    - Initially: manual process via contact form
    - Future: self-service account deletion option
  - Automated data purging for non-essential data (IPs, passive collection) in post-MVP phases

- **Compliance Considerations**:

  - **Accessibility Targets**:

    - Initial goal: WCAG 2.2 Level A compliance for essential booking functions
    - Full site goal: WCAG 2.2 Level AA compliance
    - Will use Chrome web tools and WCAG site for validation

  - **GDPR Considerations**:

    - Initially avoid using non-necessary cookies when possible
    - Implement GDPR-compliant privacy policy
    - Process for data deletion requests per GDPR requirements
    - For full system: implement cookie consent popup
    - Future: specific data deletion request option in contact form

  - **Security Measures**:
    - Implement site security best practices to prevent compromise
    - Use Stripe Elements to ensure no payment data touches our servers
    - Regular security audits and updates
    - HTTPS enforcement for all pages

### Mobile Strategy

- **MVP Mobile-First Approach**:

  - Design all interfaces with mobile as the primary usage scenario
  - Test on multiple device sizes during development
  - Ensure all critical functions (booking, viewing tickets, requesting refunds) work seamlessly on mobile
  - Desktop experience will enhance the mobile version rather than the reverse

- **Touch Optimization**:

  - Larger touch targets for buttons and interactive elements
  - Simple forms optimized for mobile input
  - Minimize typing requirements where possible

- **Responsive Considerations**:
  - Use fluid layouts that adapt to different screen sizes
  - Ensure readability of all text on small screens
  - Optimize images and assets for mobile data usage

### Error Handling and Logging Strategy

- **User-Facing Error Strategy**:

  - Friendly, non-technical error messages for users
  - Clear recovery paths when errors occur
  - Contextual guidance for resolving input errors

- **Backend Error Management**:

  - Structured error logging with severity levels
  - Transaction tracking across the system
  - Critical error notifications to administrators

- **Payment Error Handling**:

  - Special handling for Stripe integration errors
  - Clear communication about payment failures
  - Recovery options for abandoned transactions

- **Monitoring Implementation**:
  - Error tracking through Sentry
  - Regular review of error patterns
  - Performance monitoring for critical paths

### Performance Requirements

- **Initial MVP Performance Targets**:

  - Page load times under 3 seconds on 4G connections
  - Booking form submission under 5 seconds
  - Simple caching strategy for static content

- **Database Optimization**:

  - Efficient indexing for frequently queried fields
  - Simple query optimization for MVP
  - Monitoring of slow queries

- **Scaling Considerations for Future**:
  - Identify potential bottlenecks for high-traffic periods
  - Plan for vertical scaling on VPS initially
  - Document upgrade path for higher capacity needs

### External API Integration Details

- **Stripe Integration**:

  - Use [Stripe Elements](https://stripe.com/docs/elements) for secure payment form
  - Implement webhook handlers for payment events
  - Store payment intents and customer references
  - Plan for handling declined payments and retries

- **Email Service Integration**:

  - SendGrid API for transactional emails
  - Email templates for confirmations, updates, and receipts
  - Tracking of email delivery and open rates
  - Fallback procedures for email failures

- **Future Weather API Options**:
  - Research options: [OpenWeatherMap](https://openweathermap.org/api), [WeatherAPI](https://www.weatherapi.com/), [NOAA](https://www.weather.gov/documentation/services-web-api)
  - Focus on marine conditions and forecasting
  - Consider data refresh frequency requirements
  - Plan for display of relevant weather metrics

### MVP Backup Strategy

Even in the initial MVP phase, a basic backup strategy will be implemented:

- Database backups performed quarterly
- Backup frequency to be increased based on traffic and booking volume
- Simple backup scripts to automate PostgreSQL dumps
- Secure storage of backups on a separate system from the production environment
- Basic disaster recovery documentation for the operations team
- Test restoration procedure once per backup cycle

This minimal approach will protect against catastrophic data loss while more comprehensive backup and recovery strategies are developed for later phases.

### Maintenance and Support Plan

_To be developed in future phases, not required for MVP_

- Basic monitoring and maintenance procedures
- Security update process
- Regular dependency updates
- Support request handling workflow

### Disaster Recovery and Backup Strategy

_To be developed in future phases, not required for MVP_

- Daily database backups
- VPS snapshot strategy
- Recovery testing procedures
- Incident response guidelines

### Accessibility Considerations

_To be implemented in future phases, not required for MVP_

- Initial awareness of basic accessibility principles
- Plan for WCAG compliance in future iterations
- Consideration for color contrast and text sizing
- Future keyboard navigation enhancements

### Technical Documentation Plan

_To be developed in future phases, not required for MVP_

- API documentation standards
- Code documentation requirements
- System architecture documentation
- Deployment documentation

### User Feedback Collection

_To be implemented in future phases, not required for MVP_

- Future feedback mechanisms
- Feature request tracking
- User satisfaction measurement
- Iterative improvement process

## Flowcharts

![Quartermaster flowcharts](https://hackmd.io/_uploads/ByXJbAa3ye.svg)
