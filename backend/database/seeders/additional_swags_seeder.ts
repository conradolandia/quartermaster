import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSeeder {
  async run() {
    // Additional swag items
    const swags = [
      {
        id: uuidv4(),
        name: 'Star✦Fleet T-Shirt',
        description: 'Comfortable cotton T-shirt with the Star✦Fleet Tours logo',
        price: 24.99,
        default_quantity: 50,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: uuidv4(),
        name: 'Launch Viewing Hat',
        description: 'Adjustable cap with embroidered rocket design',
        price: 19.99,
        default_quantity: 30,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: uuidv4(),
        name: 'Commemorative Mission Patch',
        description: 'Limited edition mission patch for collectors',
        price: 12.99,
        default_quantity: 100,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: uuidv4(),
        name: 'SpaceX Model Rocket',
        description: 'Detailed 1:100 scale model of a Falcon 9 rocket',
        price: 49.99,
        default_quantity: 20,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      },
      {
        id: uuidv4(),
        name: 'Star✦Fleet Water Bottle',
        description: 'Insulated stainless steel bottle with the Star✦Fleet Tours logo',
        price: 29.99,
        default_quantity: 40,
        created_at: DateTime.now().toISO(),
        updated_at: DateTime.now().toISO(),
      }
    ]
    
    await db.table('swags').multiInsert(swags)
  }
} 