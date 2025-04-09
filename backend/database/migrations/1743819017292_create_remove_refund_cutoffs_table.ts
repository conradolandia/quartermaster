import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'missions'

  async up() {
    // Check if the column exists before dropping it
    const hasColumn = await this.db.rawQuery(
      "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'missions' AND column_name = 'refund_cutoff_hours')"
    )
    
    if (hasColumn.rows[0].exists) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropColumn('refund_cutoff_hours')
      })
    }
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('refund_cutoff_hours').nullable()
    })
  }
}