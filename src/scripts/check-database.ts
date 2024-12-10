import { connectToDatabase } from '@/lib/mongodb'

async function checkDatabase() {
  try {
    const { db } = await connectToDatabase()
    console.log('Connected to database')

    const users = await db.collection('users').find({}).toArray()
    console.log('Users in database:')
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Username: ${user.username}, Role: ${user.role}`)
    })

    if (users.length === 0) {
      console.log('No users found in the database')
    }
  } catch (error) {
    console.error('Error checking database:', error)
  } finally {
    process.exit(0)
  }
}

checkDatabase()

