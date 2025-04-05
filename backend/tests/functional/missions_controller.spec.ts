import { test } from '@japa/runner'
import { v4 as uuidv4 } from 'uuid'
import Mission from '#models/mission'
import Launch from '#models/launch'
import { DateTime } from 'luxon'

test.group('Missions Controller', (group) => {
  let testLaunchId: string

  // Setup: Create a test launch for our missions
  group.setup(async () => {
    const launch = new Launch()
    launch.id = uuidv4()
    launch.name = 'Test Launch'
    launch.dateTime = DateTime.local().plus({ days: 10 })
    await launch.save()
    testLaunchId = launch.id
  })

  // Cleanup: Delete test data
  group.teardown(async () => {
    await Launch.findOrFail(testLaunchId).then((launch) => launch.delete())
  })

  test('can list all missions', async ({ client }) => {
    const response = await client.get('/api/v1/missions')
    response.assertStatus(200)
    response.assertBodyContains([])
  })

  test('can create a mission', async ({ client, assert }) => {
    const missionData = {
      launch_id: testLaunchId,
      name: 'Test Mission',
      sales_open_at: DateTime.local().toISO(),
      active: true,
      public: true,
      refund_cutoff_hours: 24,
    }

    const response = await client.post('/api/v1/missions').json(missionData)
    response.assertStatus(201)
    
    const body = response.body()
    assert.equal(body.name, 'Test Mission')
    assert.equal(body.active, true)
    assert.equal(body.public, true)
    assert.equal(body.refundCutoffHours, 24)
    
    // Save mission ID for cleanup
    const missionId = body.id
    
    // Clean up
    await Mission.findOrFail(missionId).then((mission) => mission.delete())
  })

  test('can get a mission by id', async ({ client, assert }) => {
    // Create test mission
    const mission = new Mission()
    mission.id = uuidv4()
    mission.launchId = testLaunchId
    mission.name = 'Test Get Mission'
    mission.salesOpenAt = DateTime.local()
    mission.active = true
    mission.public = true
    mission.refundCutoffHours = 48
    await mission.save()
    
    const response = await client.get(`/api/v1/missions/${mission.id}`)
    response.assertStatus(200)
    response.assertBodyContains({ name: 'Test Get Mission' })
    
    // Clean up
    await mission.delete()
  })

  test('can update a mission', async ({ client, assert }) => {
    // Create test mission
    const mission = new Mission()
    mission.id = uuidv4()
    mission.launchId = testLaunchId
    mission.name = 'Original Mission Name'
    mission.salesOpenAt = DateTime.local()
    mission.active = false
    mission.public = false
    mission.refundCutoffHours = 12
    await mission.save()
    
    const response = await client.put(`/api/v1/missions/${mission.id}`).json({
      name: 'Updated Mission Name',
      active: true,
    })
    
    response.assertStatus(200)
    
    const updatedMission = await Mission.findOrFail(mission.id)
    assert.equal(updatedMission.name, 'Updated Mission Name')
    assert.equal(updatedMission.active, true)
    assert.equal(updatedMission.public, false) // Unchanged
    
    // Clean up
    await mission.delete()
  })

  test('can delete a mission', async ({ client, assert }) => {
    // Create test mission
    const mission = new Mission()
    mission.id = uuidv4()
    mission.launchId = testLaunchId
    mission.name = 'Mission to Delete'
    mission.salesOpenAt = DateTime.local()
    await mission.save()
    
    const response = await client.delete(`/api/v1/missions/${mission.id}`)
    response.assertStatus(204)
    
    const missionExists = await Mission.find(mission.id)
    assert.isNull(missionExists)
  })
})