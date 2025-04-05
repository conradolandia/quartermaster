import { test } from '@japa/runner'
import Location from '#models/location'

test.group('Location Model', () => {
  test('can create a location', async ({ assert }) => {
    const location = new Location()
    location.name = 'Cape Canaveral'
    
    await location.save()
    
    const savedLocation = await Location.find(location.id)
    assert.exists(savedLocation)
    assert.equal(savedLocation?.name, 'Cape Canaveral')
    
    // Clean up
    if (savedLocation) await savedLocation.delete()
  })
  
  test('can find a location by id', async ({ assert }) => {
    const location = new Location()
    location.name = 'Kennedy Space Center'
    
    await location.save()
    
    const foundLocation = await Location.findOrFail(location.id)
    assert.equal(foundLocation.name, 'Kennedy Space Center')
    
    // Clean up
    await location.delete()
  })
}) 