import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('booking_id').notNullable().references('id').inTable('bookings').onDelete('CASCADE')
      table.decimal('amount', 10, 2).notNullable()
      table.string('payment_intent_id', 255).notNullable()
      table.enum('status', ['paid', 'refunded', 'partially_refunded']).defaultTo('paid').notNullable()
      table.jsonb('items_purchased').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}