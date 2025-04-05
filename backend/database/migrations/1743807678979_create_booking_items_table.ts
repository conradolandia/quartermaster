import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'booking_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('booking_id').notNullable().references('id').inTable('bookings').onDelete('CASCADE')
      table.uuid('trip_id').nullable().references('id').inTable('trips')
      table.uuid('boat_id').nullable().references('id').inTable('boats')
      table.enum('item_type', ['adult_ticket', 'child_ticket', 'swag']).notNullable()
      table.integer('quantity').notNullable().defaultTo(1)
      table.decimal('price_per_unit', 10, 2).notNullable()
      table.enum('status', ['active', 'refunded', 'fulfilled']).defaultTo('active').notNullable()
      table.enum('refund_reason', ['change_in_party_size', 'could_not_make_date', 'unsatisfied', 'other']).nullable()
      table.text('refund_notes').nullable()
      table.timestamp('refunded_at', { useTz: true }).nullable()
      table.jsonb('attributes').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}