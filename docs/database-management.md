# Quartermaster Database Management

This document provides instructions for managing the Quartermaster booking system database, including commands for dropping and repopulating the database during development or maintenance.

## Prerequisites

- Docker and Docker Compose installed
- Proper access permissions to run Docker commands (may require `sudo` on Linux systems)

## Basic Database Commands

### Viewing Migration Status

To check the status of database migrations:

```bash
sudo docker exec -it backend-backend-1 node ace migration:status
```

### Running Migrations

To run pending database migrations:

```bash
sudo docker exec -it backend-backend-1 node ace migration:run
```

### Rolling Back Migrations

To rollback the last batch of migrations:

```bash
sudo docker exec -it backend-backend-1 node ace migration:rollback
```

To reset all migrations (rollback all batches):

```bash
sudo docker exec -it backend-backend-1 node ace migration:reset
```

To refresh all migrations (rollback and migrate again):

```bash
sudo docker exec -it backend-backend-1 node ace migration:refresh
```

## Database Reset and Repopulation

### Quick Reset (Development)

For development environments, to quickly reset the database (drop and recreate all tables):

```bash
# Step 1: Wipe the database (drop all tables)
sudo docker exec -it backend-backend-1 node ace db:wipe

# Step 2: Run migrations to recreate tables
sudo docker exec -it backend-backend-1 node ace migration:run

# Step 3: Seed the database with initial data
sudo docker exec -it backend-backend-1 node ace db:seed
```

### Selective Seeding

To run specific seeders:

```bash
# Run a specific seeder
sudo docker exec -it backend-backend-1 node ace db:seed --files=database/seeders/01_initial_datum_seeder.ts

# Run another specific seeder
sudo docker exec -it backend-backend-1 node ace db:seed --files=database/seeders/additional_swags_seeder.ts
```

The recommended seeding order is:

1. `01_initial_datum_seeder.ts` - Creates baseline data (locations, launches, etc.)
2. `additional_swags_seeder.ts` - Adds additional swag items
3. `admin_seeder.ts` - Creates admin user(s)
4. `booking_seeder.ts` - Creates sample bookings

### Truncating Tables

To clear all data from tables without dropping them:

```bash
sudo docker exec -it backend-backend-1 node ace db:truncate
```

## Common Errors and Troubleshooting

### Foreign Key Constraints

If you encounter foreign key constraint errors during seeding:

```
insert into "jurisdictions" (...) - violates foreign key constraint "jurisdictions_location_id_foreign"
```

Make sure to:
1. Run migrations before seeding
2. Run seeders in the correct order
3. Check for model hooks that might override explicitly set IDs

### UUIDs and Model Hooks

Some models (like Location) have `@beforeCreate` hooks that automatically assign UUIDs, which can conflict with explicitly set IDs in seeders. The updated seeders account for this by:

1. Using `create()` instead of `updateOrCreate()` for initial records
2. Capturing generated IDs and using them for related records
3. Using `console.log()` statements to track created records and their IDs

## Production Considerations

For production environments:

1. **Always backup the database before operations**
2. Use `--force` flag with caution
3. Consider using a migration strategy that preserves data
4. Test changes in a staging environment first

## Complete Reset Script

For development only, here's a complete reset script:

```bash
#!/bin/bash
echo "Resetting Quartermaster database..."

# 1. Drop all tables
sudo docker exec -it backend-backend-1 node ace db:wipe
echo "Database wiped."

# 2. Run migrations
sudo docker exec -it backend-backend-1 node ace migration:run
echo "Migrations complete."

# 3. Run seeders in order
sudo docker exec -it backend-backend-1 node ace db:seed --files=database/seeders/01_initial_datum_seeder.ts
sudo docker exec -it backend-backend-1 node ace db:seed --files=database/seeders/additional_swags_seeder.ts
sudo docker exec -it backend-backend-1 node ace db:seed --files=database/seeders/admin_seeder.ts
sudo docker exec -it backend-backend-1 node ace db:seed --files=database/seeders/booking_seeder.ts
echo "Database seeded successfully."

echo "Database reset complete!"
```

Save this as `reset-db.sh` in your project root, make it executable with `chmod +x reset-db.sh`, and run it when needed.

## Database Exploration

To explore the database using the AdonisJS REPL:

```bash
sudo docker exec -it backend-backend-1 node ace repl
```

Then, in the REPL:

```js
const { default: db } = await import('@adonisjs/lucid/services/db')
const users = await db.from('users').select('*')
console.log(users)
```

Exit the REPL by typing `.exit` or pressing Ctrl+D.
