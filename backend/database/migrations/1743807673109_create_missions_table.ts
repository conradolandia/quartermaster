import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'missions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('launch_id').notNullable().references('id').inTable('launches')
      table.string('name', 255).notNullable()
      table.timestamp('sales_open_at', { useTz: true }).notNullable()
      table.boolean('active').defaultTo(false).notNullable()
      table.boolean('public').defaultTo(false).notNullable()
      table.integer('refund_cutoff_hours').defaultTo(12).notNullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}