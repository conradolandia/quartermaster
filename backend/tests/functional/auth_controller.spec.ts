import { test } from '@japa/runner'
import AdminUser, { AdminRole } from '#models/admin_user'

test.group('Authentication', (group) => {
  // Clean up before each test
  group.each.setup(async () => {
    await AdminUser.query().delete()
  })

  test('register admin user', async ({ client }) => {
    const uniqueEmail = `admin_${Date.now()}@example.com`
    const response = await client.post('/auth/admin/register').json({
      email: uniqueEmail,
      password: 'admin123',
      name: 'Admin User',
      role: AdminRole.ADMIN,
    })

    response.assertStatus(201)
    response.assertBodyContains({ admin: { email: uniqueEmail } })
    response.assertBodyContains({ token: response.body().token })
  })
}) 