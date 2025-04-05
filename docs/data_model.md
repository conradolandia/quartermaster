# Quartermaster Data Model

> **Note**: This document details the database schema and data specifications for the Quartermaster booking system. For a high-level system overview, see [System Overview](./system_overview.md).

## Form fields for user booking

- Phase 0: Launch selection
  - Select launch to book (done on static side via clicking appropriate link/button)
- Phase 1: Trip details
  - Mission selection (if multiple attempts exist for the launch)
  - Launch viewing trip
    - Number of pax/tickets
    - Boat selection (if offered)
  - Pre-launch trip
    - Number of pax/tickets
    - Date/time selection
    - Boat selection (if offered)
  - Swag
    - \# of additional Star Fleet decals
    - Eventually T-shirts, patches, other things (but not for now)
  - Other
    - Discount code/credit (can be percent based, or for a fixed amount)
    - Optional tip (dollar amount).
      - CRITICAL: Check for negative tip frontend and backend and cap at 0!)
    - Order Comments/special needs
  - Page displays current subtotal, e.g. top right
- Phase 2: Confirm and pay
  - All of this minus card info and ToC agreement could be saved and autofilled for account holders
  - Itemized list of charges
    - Subtotal
    - Discount (percent/amount)
    - Tip
    - Sales tax, set per-mission based on the location
    - Total due
  - Personal details
    - First and last name for reservation
    - Email
      - Note it will be used for updates on the launch/trip
      - Checkbox if they would like updates about future launches
    - Phone
  - Card details
    - Stripe widget
    - Name on card
  - Billing address - Country - Line 1 - Line 2 - City - State/province - Postcode
    Agreement box(es) - Check box that they understand terms and conditions, scrub policy and refund policy (with links to these and brief summary) - Disable submission if not checked
- Phase 3: Confirmation/Ticket Page
  - Persistent URL with their last name, confirmation code and mission as params
    - Later we could build a reservation finder where people entered these details to find their reservation
  - Title: Reservation is confirmed (or cancelled if so)
  - QR Code ticket (leads to endpoint on admin page with their details as params)
  - Confirmation message
  - Their name
  - Boat name, address, checkin/boarding/departure date/time
  - Itemized list of what they booked w/cost
  - Now or later, button to request a refund, brings up a dialog with a reason selection and a text box for a short message
  - Later, option to add more spots/swag, etc. to the existing reservation

## Data model per trip/launch

X-marked items are required now for the MVP reservation system while others would be added in the future to support the static site or desired capabilities. The launch-related fields, while I came up with them without actually checking the documentation, precisely matches the [the r/SpaceX API](https://github.com/r-spacex/SpaceX-API/tree/master/docs#rspacex-api-docs) — convenient for future automated retrieval

A Launch can have multiple Missions (Take 1, Take 2, etc.) if the launch scrubs or is significantly delayed. Each Mission has its own set of Trips (both launch viewing and pre-launch trips). A Mission and its Trips could be created at the same time, or an existing Launch could be selected to associate a Mission to and automatically load the relevant data.

Eventually we could have presets (e.g. Starbase, Cape) that would autofill most of the launch info.

In the following lists, a checked mark indicates a required field.

### Launch data

- [x] **Launch name**, e.g. `SpaceX Starship Flight 9`)
- [x] **Launch ID** (Auto-generated from name or can be manually set), e.g. `spacex-starship-flight-9`
- [x] **Launch timestamp** (Unix timestamp internally, typically entered and displayed up to the minute if available).
  - [ ] **Precision level** (how accurately is the launch time currently known and should be displayed to), e.g. year, half, quarter, month, week, day, hour, minute, second
  - [ ] **TBD flag** (for a launch whose time is currently unknown/in flux, e.g. after a scrub (aborted launch attempt on the pad) and before an announcement of a new time)
  - [ ] **NET flag** (whether the time is "No Earlier Than", i.e. there is uncertainty whether the launch date will hold and `No Earlier Than`/`NET` should be displayed in front of the timestamp
  - [ ] **Launch window close time** (some launches have a time window, typically 5 minutes to several hours, over which they can occur; null if unknown or 0 if instantaneous - these could also be set as TBD and instantaneous flags
- [x] **Summary** (short one-line description), e.g. `The SpaceX Starship, the most powerful rocket in history, will attempt once again to launch and land in a bid to finally prove out the new Starship V2 upper stage.`
- [x] **Location ID**
  - [ ] **Launch pad** (enum per location, e.g. LC-39A, LP-A)
- [ ] **Rocket** (enum, Falcon 9, Atlas V, Starship)
- [ ] **Payload** (text), e.g. GOES-U, 23 Starlink V2 satellites
- [ ] **Customer** (text) e.g. NASA, Starlink
- [x] **created_at** (timestamp)
- [x] **updated_at** (timestamp)

### Location data

- [x] **ID** (e.g. `cape`, `starbase`)
- [x] **Name**
- [ ] **Launch pads**
  - [ ] **ID**
  - [ ] **Name**
  - [ ] **Rocket IDs**
- [ ] Other defaults
- [x] **created_at** (timestamp)
- [x] **updated_at** (timestamp)

### Jurisdiction data

- [x] **ID** (e.g. `port_canaveral`, `spi`)
- [x] **Name**
- [x] **State** (e.g., Florida, Texas)
- [x] **Sales tax rate**
- [x] **Location ID**
- [x] **created_at** (timestamp)
- [x] **updated_at** (timestamp)

### Mission data

- [x] **ID** (auto-generated UUID)
- [x] **Launch ID** (connection to associated launch)
- [x] **Name** (e.g., "Falcon Heavy - Take 1")
- [x] **Timestamp to open public tickets** (for countdown) - stored as `sales_open_at`
- [x] **Active flag** - whether taking reservations in any form
- [x] **Public flag** - whether shown to the public via normal link or need special early-bird link
- [x] **Refund cutoff hours** - hours before launch when refunds become unavailable (default: 12)
- [ ] **Canceled** - whether the mission as a whole was canceled
- [x] **created_at** (timestamp)
- [x] **updated_at** (timestamp)

### Trip data

- [x] **ID** (auto-generated UUID)
- [x] **Mission ID** (connection to associated mission)
- [x] **Type** (launch_viewing or pre_launch)
- [x] **Active flag** - whether taking reservations
- [ ] **Trip summary** (short one-line description)
- [x] **Check-in time** (for launch_viewing: set automatically to T-2 hours from associated launch time)
- [x] **Boarding time** (for launch_viewing: set automatically to T-1.5 hours from associated launch time)
- [x] **Departure time** (for launch_viewing: set automatically to T-1 hour from associated launch time, for pre_launch: specific time with check-in and boarding set to T-30 min and T-15 min)
- [x] **created_at** (timestamp)
- [x] **updated_at** (timestamp)

### Trip Boats data

- [x] **ID** (auto-generated UUID)
- [x] **Trip ID** (foreign key to trips table)
- [x] **Boat ID** (foreign key to boats table)
- [x] **Max capacity** (optional override of boat's standard capacity)
- [x] **created_at** (timestamp)
- [x] **updated_at** (timestamp)

### Boat Provider data

- [x] **ID** (auto-generated UUID)
- [x] **Name**
- [x] **Location description**
- [x] **Address**
- [x] **Jurisdiction ID**
- [x] **Map link**
- [x] **created_at** (timestamp)
- [x] **updated_at** (timestamp)

### Boat data

- [x] **ID** (auto-generated UUID)
- [x] **Name**
- [x] **Capacity** (maximum passenger capacity)
- [x] **Provider ID** (foreign key to boat_providers table)
- [ ] **Image**
- [ ] Future: Other per-boat details/amenities (restroom(s), food, decks, description, etc.)
- [x] **created_at** (timestamp)
- [x] **updated_at** (timestamp)

### Swag data

- [x] **ID** (auto-generated UUID)
- [x] **Name**
- [x] **Description**
- [x] **Price**
- [ ] **Image**
- [x] **Default quantity available**
- [x] **created_at** (timestamp)
- [x] **updated_at** (timestamp)

### Booking data

- [x] **ID** (auto-generated UUID)
- [x] **Confirmation code** (unique identifier for customer reference, used in QR codes and lookup)
- [x] **Mission ID** (foreign key to missions table)
- [x] **User name** (full name for reservation)
- [x] **User email**
- [x] **User phone**
- [x] **Billing address** (full address as text)
- [x] **Subtotal** (sum of all items before discounts and taxes)
- [x] **Discount amount** (total discount applied)
- [x] **Tax amount** (calculated sales tax)
- [x] **Tip amount** (optional tip, non-negative value only)
- [x] **Total amount** (final amount charged)
- [x] **Payment intent ID** (Stripe reference for payment processing and refunds)
- [x] **Special requests** (customer comments or special needs)
- [x] **Status** (pending_payment, confirmed, checked_in, completed, cancelled, refunded)
- [x] **Launch updates preference** (whether customer wants updates about future launches)
- [x] **created_at** (timestamp when booking was created)
- [x] **updated_at** (timestamp when booking was last updated)

### Booking Items data

- [x] **ID** (auto-generated UUID)
- [x] **Booking ID** (foreign key to bookings table)
- [x] **Trip ID** (foreign key to trips table, only for trip tickets)
- [x] **Boat ID** (foreign key to boats table, only for trip tickets)
- [x] **Item type** (adult_ticket, child_ticket, swag, etc.)
- [x] **Quantity**
- [x] **Price per unit**
- [x] **Status** (active, refunded, fulfilled)
- [x] **Refund reason** (change_in_party_size, could_not_make_date, unsatisfied, other)
- [x] **Refund notes** (additional explanation, especially when reason is "other")
- [x] **Refunded at** (timestamp when refund was processed)
- [x] **Attributes** (JSONB for type-specific details)
- [x] **created_at** (timestamp)
- [x] **updated_at** (timestamp)

### Payment data (Phase 2+)

- [x] **ID** (auto-generated UUID)
- [x] **Booking ID** (foreign key to bookings table)
- [x] **Amount** (amount of this payment)
- [x] **Payment intent ID** (Stripe reference)
- [x] **Status** (paid, refunded, partially_refunded)
- [x] **Items purchased** (reference to booking items purchased in this transaction)
- [x] **created_at** (timestamp)
- [x] **updated_at** (timestamp)

## Capacity Tracking

Real-time capacity tracking is implemented through the following mechanism:

1. Each trip is associated with one or more boats through the trip_boats table
2. Each boat has a maximum capacity, which can be overridden at the trip level
3. When a booking is made:
   - The system checks available capacity before confirming
   - Capacity is reduced by the number of tickets purchased
4. When a booking is cancelled or refunded:
   - Capacity is restored for the affected trip/boat
5. Admin interface provides real-time capacity monitoring:
   - Total capacity per trip/boat
   - Booked capacity
   - Available capacity
   - Overbooked status (if admin override was used)

## QR Code Implementation

QR codes for tickets:

1. **Content**: URL with booking ID parameter
   - Example: `https://admin.star-fleet.tours/check-in?booking=ABC123`
2. **Generation**: Created upon successful booking completion
3. **Delivery**: Embedded in confirmation page and email
4. **Validation**: Admin selects active trip/boat context before scanning
5. **Check-in process**:
   - QR code is scanned
   - System validates booking against selected trip/boat context
   - On successful validation, relevant item status updated to "fulfilled"

## Data Retention

1. **User data**:
   - Basic contact information retained for operational communications
   - For guest checkouts: sensitive data (address, phone) purged after one year
   - Full retention for users who create accounts (future feature)
2. **Payment information**:
   - No credit card details stored in our system (handled by Stripe)
   - Payment references retained for refund processing
3. **Deletion requests**:
   - Manual process via contact form (MVP)
   - Self-service account deletion (future feature)
