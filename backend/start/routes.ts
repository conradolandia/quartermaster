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

// Auth routes
const AuthController = () => import('#controllers/auth_controller')
router.post('auth/register', [AuthController, 'register'])
router.post('auth/login', [AuthController, 'login'])

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
  
  // Protected routes requiring authentication
  router.group(() => {
    // Booking routes - all users can create and view their own bookings
    const BookingsController = () => import('#controllers/bookings_controller')
    router.resource('bookings', BookingsController)
    
    // Admin-only routes
    router.group(() => {
      // Admin can create/update/delete locations
      router.post('locations', [LocationsController, 'store'])
      router.put('locations/:id', [LocationsController, 'update'])
      router.delete('locations/:id', [LocationsController, 'destroy'])
      
      // Admin can create/update/delete launches
      router.post('launches', [LaunchesController, 'store'])
      router.put('launches/:id', [LaunchesController, 'update'])
      router.delete('launches/:id', [LaunchesController, 'destroy'])
      
      // Admin can create/update/delete missions
      router.post('missions', [MissionsController, 'store'])
      router.put('missions/:id', [MissionsController, 'update'])
      router.delete('missions/:id', [MissionsController, 'destroy'])
      
      // Admin can create/update/delete trips
      router.post('trips', [TripsController, 'store'])
      router.put('trips/:id', [TripsController, 'update'])
      router.delete('trips/:id', [TripsController, 'destroy'])
    }).use(middleware.auth())
  }).use(middleware.auth())
}).prefix('/api/v1')
