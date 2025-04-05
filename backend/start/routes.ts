/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// API routes
router.group(() => {
  // Locations
  router.get('/locations', '#controllers/locations_controller.index')
  router.get('/locations/:id', '#controllers/locations_controller.show')
  router.post('/locations', '#controllers/locations_controller.store')
  router.put('/locations/:id', '#controllers/locations_controller.update')
  router.delete('/locations/:id', '#controllers/locations_controller.destroy')

  // Launches
  router.get('/launches', '#controllers/launches_controller.index')
  router.get('/launches/:id', '#controllers/launches_controller.show')
  router.post('/launches', '#controllers/launches_controller.store')
  router.put('/launches/:id', '#controllers/launches_controller.update')
  router.delete('/launches/:id', '#controllers/launches_controller.destroy')

  // Missions
  router.get('/missions', '#controllers/missions_controller.index')
  router.get('/missions/:id', '#controllers/missions_controller.show')
  router.post('/missions', '#controllers/missions_controller.store')
  router.put('/missions/:id', '#controllers/missions_controller.update')
  router.delete('/missions/:id', '#controllers/missions_controller.destroy')

  // Trips
  router.get('/trips', '#controllers/trips_controller.index')
  router.get('/trips/:id', '#controllers/trips_controller.show')
  router.post('/trips', '#controllers/trips_controller.store')
  router.put('/trips/:id', '#controllers/trips_controller.update')
  router.delete('/trips/:id', '#controllers/trips_controller.destroy')

  // Bookings
  router.get('/bookings', '#controllers/bookings_controller.index')
  router.get('/bookings/:id', '#controllers/bookings_controller.show')
  router.post('/bookings', '#controllers/bookings_controller.store')
  router.put('/bookings/:id', '#controllers/bookings_controller.update')
  router.delete('/bookings/:id', '#controllers/bookings_controller.destroy')
}).prefix('/api/v1')
