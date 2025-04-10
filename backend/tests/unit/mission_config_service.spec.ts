import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import MissionConfigService from '#services/MissionConfigService' // Adjust path if needed
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url' // Needed for ESM __dirname equivalent

// --- Setup __dirname equivalent for ESM ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Use app.makePath relative to the project root for consistency
const dataDirectoryPath = app.makePath('data')
const actualConfigPath = path.join(dataDirectoryPath, 'missions.yml')
const testConfigPath = path.join(dataDirectoryPath, '_test_missions.yml')
const backupConfigPath = actualConfigPath + '.bak' // Backup path

// --- End Setup ---

// Define a mock YAML structure for testing
const mockYamlContent = `
launch:
  id: test-launch-1
  name: Test Launch 1
  date_time: 2024-01-01T12:00:00Z
  location_id: test-location

missions:
  - id: test-mission-1
    name: Test Mission 1
    launch_id: test-launch-1
    active: true
    public: true
    sales_open_at: 2023-12-01T00:00:00Z
    refund_cutoff_hours: 12
    trips:
      - id: test-trip-1
        type: launch_viewing
        check_in_time: 2024-01-01T10:00:00Z
        boarding_time: 2024-01-01T10:30:00Z
        departure_time: 2024-01-01T11:00:00Z
        pricing:
          adult_ticket: 100.00
          child_ticket: 50.00
        boats:
          - boat_id: test-boat-A
            max_capacity: 10
`

test.group('MissionConfigService', (group) => {
  // Use the path inside the 'data' directory
  // const testConfigPath = path.join(app.configPath(), 'test_missions.yml') // OLD PATH
  // const actualConfigPath = path.join(app.configPath(), 'missions.yml') // OLD PATH

  group.setup(() => {
    // Backup original if exists
    if (fs.existsSync(actualConfigPath)) {
      fs.copyFileSync(actualConfigPath, backupConfigPath)
      fs.unlinkSync(actualConfigPath) // Remove original after backup
    }
    // Ensure data directory exists
    if (!fs.existsSync(dataDirectoryPath)) {
      fs.mkdirSync(dataDirectoryPath, { recursive: true })
    }
    // Create the temporary test config file
    fs.writeFileSync(testConfigPath, mockYamlContent)
  })

  group.teardown(() => {
    // Clean up test file
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath)
    }
    // Clean up any leftover renamed file (shouldn't exist if finally blocks worked)
    if (fs.existsSync(actualConfigPath)) {
      fs.unlinkSync(actualConfigPath)
    }
    // Restore original from backup if it exists
    if (fs.existsSync(backupConfigPath)) {
      fs.renameSync(backupConfigPath, actualConfigPath)
    }
  })

  // Clean up potential leftovers before each test
  group.each.setup(() => {
    // Delete the potentially renamed test file from previous run
    if (fs.existsSync(actualConfigPath)) {
      fs.unlinkSync(actualConfigPath)
    }
    // Ensure the base test file is present
    if (!fs.existsSync(testConfigPath)) {
      fs.writeFileSync(testConfigPath, mockYamlContent)
    }
  })

  test('should load config without errors', async ({ assert }) => {
    let service: MissionConfigService | undefined
    try {
      // Rename BEFORE creating service instance
      fs.renameSync(testConfigPath, actualConfigPath)
      service = new MissionConfigService() // Instantiate AFTER rename

      assert.isDefined(service) // Simple check that instantiation worked

      // Verify some loaded data
      const mission = service.getMissionConfig('test-mission-1')
      assert.isDefined(mission)
      assert.equal(mission?.name, 'Test Mission 1')
    } finally {
      // Clean up the renamed file immediately after the test
      if (fs.existsSync(actualConfigPath)) {
        fs.unlinkSync(actualConfigPath)
      }
    }
  }).timeout(0)

  test('getMissionConfig should return correct mission', async ({ assert }) => {
    let service: MissionConfigService | undefined
    try {
      // Rename BEFORE creating service instance
      fs.renameSync(testConfigPath, actualConfigPath)
      service = new MissionConfigService() // Instantiate AFTER rename

      const mission = service.getMissionConfig('test-mission-1')
      assert.isDefined(mission)
      assert.equal(mission?.id, 'test-mission-1')
      assert.equal(mission?.name, 'Test Mission 1')

      const nonExistent = service.getMissionConfig('non-existent-mission')
      assert.isUndefined(nonExistent)
    } finally {
      // Clean up the renamed file immediately after the test
      if (fs.existsSync(actualConfigPath)) {
        fs.unlinkSync(actualConfigPath)
      }
    }
  }).timeout(0)

  test('getTripConfig should return correct trip', async ({ assert }) => {
    let service: MissionConfigService | undefined
    try {
      // Rename BEFORE creating service instance
      fs.renameSync(testConfigPath, actualConfigPath)
      service = new MissionConfigService() // Instantiate AFTER rename

      const trip = service.getTripConfig('test-mission-1', 'test-trip-1')
      assert.isDefined(trip)
      assert.equal(trip?.id, 'test-trip-1')
      assert.equal(trip?.type, 'launch_viewing')

      const nonExistent = service.getTripConfig('test-mission-1', 'non-existent-trip')
      assert.isUndefined(nonExistent)
    } finally {
      // Clean up the renamed file immediately after the test
      if (fs.existsSync(actualConfigPath)) {
        fs.unlinkSync(actualConfigPath)
      }
    }
  }).timeout(0)

  test('getTripPrice should return correct price', async ({ assert }) => {
    let service: MissionConfigService | undefined
    try {
      // Rename BEFORE creating service instance
      fs.renameSync(testConfigPath, actualConfigPath)
      service = new MissionConfigService() // Instantiate AFTER rename

      const adultPrice = service.getTripPrice('test-mission-1', 'test-trip-1', 'adult_ticket')
      assert.equal(adultPrice, 100.00)

      const childPrice = service.getTripPrice('test-mission-1', 'test-trip-1', 'child_ticket')
      assert.equal(childPrice, 50.00)

      const nonExistentPrice = service.getTripPrice('test-mission-1', 'test-trip-1', 'non_existent_item')
      assert.isUndefined(nonExistentPrice)
    } finally {
      // Clean up the renamed file immediately after the test
      if (fs.existsSync(actualConfigPath)) {
        fs.unlinkSync(actualConfigPath)
      }
    }
  }).timeout(0)

  // Add more tests for other getter methods (getLaunchConfig, getMissionsForLaunch, getBoatConfig, etc.)
  // Add tests for error handling (e.g., if config file is missing or malformed - might need mocking)
}) 