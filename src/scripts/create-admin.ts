import { hash } from 'bcrypt'
import { connectToDatabase } from '@/lib/mongodb'

async function createAdminUser() {
  try {
    const { db } = await connectToDatabase()
    console.log('Connected to database')

    const existingAdmin = await db.collection('users').findOne({ role: 'admin' })
    if (existingAdmin) {
      console.log('An admin user already exists:', existingAdmin.email)
      return
    }

    const hashedPassword = await hash('admin123', 10)
    const newAdmin = {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.collection('users').insertOne(newAdmin)
    console.log('New admin user created successfully:', newAdmin.email)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    process.exit(0)
  }
}

createAdminUser()

