import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('confirmation_code').notNullable().unique()
      table.uuid('mission_id').notNullable().references('id').inTable('missions').onDelete('CASCADE')
      table.string('user_name', 255).notNullable()
      table.string('user_email', 255).notNullable()
      table.string('user_phone', 50).notNullable()
      table.text('billing_address').notNullable()
      table.decimal('subtotal', 10, 2).notNullable()
      table.decimal('discount_amount', 10, 2).notNullable().defaultTo(0)
      table.decimal('tax_amount', 10, 2).notNullable().defaultTo(0)
      table.decimal('tip_amount', 10, 2).notNullable().defaultTo(0)
      table.decimal('total_amount', 10, 2).notNullable()
      table.string('payment_intent_id', 255).nullable()
      table.text('special_requests').nullable()
      table.enum('status', ['pending_payment', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded']).defaultTo('pending_payment').notNullable()
      table.boolean('launch_updates_preference').defaultTo(false).notNullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}