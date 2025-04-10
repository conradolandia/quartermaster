**Relevant MVP API Endpoints:**

*   **`POST /api/v1/bookings`**: Creates a new booking.
*   **`GET /api/v1/bookings`**: Lists existing bookings (useful for checking results).
*   **`GET /api/v1/bookings/:id`**: Retrieves details of a specific booking by its UUID.
*   **`GET /api/v1/missions`**: Lists available missions (to find the `missionId` needed for booking).
*   **`GET /api/v1/missions/:id`**: Gets details of a specific mission, including its trips and boats (to find `tripId` and `boatId`).


**Example `curl` Commands:**


**0. Get Missions (to find IDs):**

*   **Purpose:** To find the `missionId` UUID needed for creating a booking.
*   **Command:**
    ```bash
    curl -X GET http://localhost:3333/api/v1/missions | cat -pp
    ```
*   **Expected Result:**
    *   **Status Code:** `200 OK`
    *   **Response Body:** A JSON array of mission objects. Look for the `id` field of the mission you want to book.


**1. Create a Successful Booking:**

*   **Purpose:** Tests the main booking creation flow.
*   **Pre-requisites:** Valid UUIDs for `missionId`, `tripId`, and `boatId` that exist in the database and correspond to an active mission/trip/boat setup (like the one in `booking_creation.spec.ts`).
*   **Command:**
    ```bash
    curl -X POST http://localhost:3333/api/v1/bookings \
    -H "Content-Type: application/json" \
    -d '{
      "missionId": "YOUR_MISSION_DB_UUID",
      "userName": "Manual Tester",
      "userEmail": "manual@example.com",
      "userPhone": "5551234567",
      "billingAddress": "456 Curl Street, Command Line City, CL 10001",
      "tipAmount": 5.00,
      "items": [
        {
          "tripId": "YOUR_TRIP_DB_UUID",
          "boatId": "YOUR_BOAT_DB_UUID",
          "itemType": "adult_ticket",
          "quantity": 1
        }
      ]
    }' | cat -pp
    ```
*   **Expected Result:**
    *   **Status Code:** `201 Created`
    *   **Response Body:** A JSON object representing the newly created booking. It should include:
        *   The details you provided (`userName`, `userEmail`, etc.).
        *   Calculated `subtotal`, `taxAmount`, `totalAmount`.
        *   A unique `id` (UUID) and `confirmationCode`.
        *   The `tipAmount` you specified.
        *   `status`: `"confirmed"` (because of the mock payment).
        *   An array `bookingItems` with the details of the ticket booked.


**2. Attempt to Create a Booking Exceeding Capacity:**

*   **Purpose:** Tests the capacity validation.
*   **Pre-requisites:** You need a trip/boat combination that is almost full or completely full. You might need to create a booking first to fill up most spots.
*   **Command:** (Modify `quantity` to exceed available spots)
    ```bash
    curl -X POST http://localhost:3333/api/v1/bookings \
    -H "Content-Type: application/json" \
    -d '{
      "missionId": "YOUR_MISSION_DB_UUID",
      "userName": "Capacity Tester",
      "userEmail": "capacity@example.com",
      "userPhone": "5559998888",
      "billingAddress": "789 Limit Lane",
      "items": [
        {
          "tripId": "YOUR_TRIP_DB_UUID",
          "boatId": "YOUR_ALMOST_FULL_BOAT_DB_UUID",
          "itemType": "adult_ticket",
          "quantity": 1000 
        }
      ]
    }' | cat -pp
    ```
*   **Expected Result:**
    *   **Status Code:** `409 Conflict`
    *   **Response Body:** A JSON object with an error message, similar to:
        ```json
        {
          "message": "Not enough capacity on boat [Boat Name/ID] for trip [Trip Name/ID]"
        }
        ```


**3. Attempt to Create a Booking with Invalid UUID:**

*   **Purpose:** Tests input validation for UUID format.
*   **Command:**
    ```bash
    curl -X POST http://localhost:3333/api/v1/bookings \
    -H "Content-Type: application/json" \
    -d '{
      "missionId": "not-a-valid-uuid", 
      "userName": "Invalid ID Tester",
      "userEmail": "invalid@example.com",
      "userPhone": "5551112222",
      "billingAddress": "1 Error Road",
      "items": [
        {
          "tripId": "YOUR_TRIP_DB_UUID",
          "boatId": "YOUR_BOAT_DB_UUID",
          "itemType": "adult_ticket",
          "quantity": 1
        }
      ]
    }' | cat -pp
    ```
*   **Expected Result:**
    *   **Status Code:** `422 Unprocessable Entity`
    *   **Response Body:** A JSON object detailing the validation errors, including one for `missionId` not matching the 'uuid' rule.
