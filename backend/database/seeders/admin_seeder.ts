import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { seedAdminUser } from '../../tests/helpers/auth_helper.js'

export default class AdminSeeder extends BaseSeeder {
  async run() {
    // Create a default admin user
    await seedAdminUser()
  }
} 