import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_access_tokens'

  async up() {
    // First clear all tokens to start fresh
    await this.db.rawQuery('TRUNCATE TABLE auth_access_tokens')
    
    // Add a default value for tokenable_type for all new tokens
    this.schema.alterTable(this.tableName, (table) => {
      table.string('tokenable_type').notNullable().defaultTo('admin').alter()
    })
  }

  async down() {
    // No down migration needed
    this.schema.alterTable(this.tableName, (table) => {
      table.string('tokenable_type').notNullable().alter()
    })
  }
}