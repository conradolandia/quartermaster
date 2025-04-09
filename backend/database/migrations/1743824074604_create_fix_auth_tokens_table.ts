import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_access_tokens'

  async up() {
    // 1. First drop existing tokens since they don't have tokenable_type
    await this.db.rawQuery('TRUNCATE TABLE auth_access_tokens')
    
    // 2. Make sure the tokenable_id is text and not string
    this.schema.alterTable(this.tableName, (table) => {
      // First drop the column if it exists with the wrong type
      table.dropColumn('tokenable_id')
    })
    
    this.schema.alterTable(this.tableName, (table) => {
      // Create the column with text type
      table.text('tokenable_id').notNullable()
      
      // Check if tokenable_type column exists, if not add it
      if (!this.schema.hasColumn(this.tableName, 'tokenable_type')) {
        table.string('tokenable_type').notNullable().defaultTo('user')
      }
    })
  }

  async down() {
    // No action needed for rollback since this is a fix
  }
}