import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'missions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('refund_cutoff_hours')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('refund_cutoff_hours').defaultTo(12).notNullable()
    })
  }
}