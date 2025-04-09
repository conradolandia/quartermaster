/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Auth routes - Only admin auth for MVP
const AuthController = () => import('#controllers/auth_controller')
router.post('auth/admin/register', [AuthController, 'registerAdmin'])
router.post('auth/admin/login', [AuthController, 'loginAdmin'])

// API V1 routes
router.group(() => {
  // Public routes
  const LocationsController = () => import('#controllers/locations_controller')
  router.get('locations', [LocationsController, 'index'])
  router.get('locations/:id', [LocationsController, 'show'])
  
  const LaunchesController = () => import('#controllers/launches_controller')
  router.get('launches', [LaunchesController, 'index'])
  router.get('launches/:id', [LaunchesController, 'show'])
  
  const MissionsController = () => import('#controllers/missions_controller')
  router.get('missions', [MissionsController, 'index'])
  router.get('missions/:id', [MissionsController, 'show'])
  
  const TripsController = () => import('#controllers/trips_controller')
  router.get('trips', [TripsController, 'index'])
  router.get('trips/:id', [TripsController, 'show'])
  
  // Add routes for jurisdictions, boats, and boat providers
  router.get('jurisdictions', async ({ response }) => {
    const jurisdictions = await import('#models/jurisdiction')
      .then(module => module.default.query().preload('location'))
    return response.ok(jurisdictions)
  })
  
  router.get('boats', async ({ response }) => {
    const boats = await import('#models/boat')
      .then(module => module.default.query().preload('provider'))
    return response.ok(boats)
  })
  
  router.get('boat-providers', async ({ response }) => {
    const providers = await import('#models/boat_provider')
      .then(module => module.default.query().preload('jurisdiction'))
    return response.ok(providers)
  })
  
  // Add endpoint for swag items
  router.get('swags', async ({ response }) => {
    const swags = await import('#models/swag')
      .then(module => module.default.query())
    return response.ok(swags)
  })
  
  // Add endpoint for trip boats
  router.get('trip-boats', async ({ response }) => {
    const tripBoats = await import('#models/trip_boat')
      .then(module => module.default.query().preload('trip').preload('boat'))
    return response.ok(tripBoats)
  })
  
  // Booking routes - public access for MVP
  const BookingsController = () => import('#controllers/bookings_controller')
  router.post('bookings', [BookingsController, 'store'])
  router.get('bookings/:confirmationCode', [BookingsController, 'show'])
    
  // For testing purposes, all routes are public - In production these would be protected
  // Admin functions
  router.post('locations', [LocationsController, 'store'])
  router.put('locations/:id', [LocationsController, 'update'])
  router.delete('locations/:id', [LocationsController, 'destroy'])
  
  router.post('launches', [LaunchesController, 'store'])
  router.put('launches/:id', [LaunchesController, 'update'])
  router.delete('launches/:id', [LaunchesController, 'destroy'])
  
  router.post('missions', [MissionsController, 'store'])
  router.put('missions/:id', [MissionsController, 'update'])
  router.delete('missions/:id', [MissionsController, 'destroy'])
  
  router.post('trips', [TripsController, 'store'])
  router.put('trips/:id', [TripsController, 'update'])
  router.delete('trips/:id', [TripsController, 'destroy'])
  
  router.get('bookings', [BookingsController, 'index'])
}).prefix('/api/v1')
