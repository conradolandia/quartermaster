import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trips'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('mission_id').notNullable().references('id').inTable('missions').onDelete('CASCADE')
      table.enum('type', ['launch_viewing', 'pre_launch']).notNullable()
      table.string('config_id').notNullable().unique()
      table.boolean('active').defaultTo(false).notNullable()
      table.timestamp('check_in_time', { useTz: true }).notNullable()
      table.timestamp('boarding_time', { useTz: true }).notNullable()
      table.timestamp('departure_time', { useTz: true }).notNullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}