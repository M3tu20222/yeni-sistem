import { connectToDatabase } from '@/lib/mongodb'
import { Badge } from '@/models/Badge'

const badges = [
  {
    name: 'Bilgi Kurdu',
    description: 'Bir derste en yüksek notu alan öğrenci',
    category: 'academic',
    icon: 'brain',
    criteria: 'Bir derste en yüksek notu almak'
  },
  {
    name: 'Çalışkan Arı',
    description: 'Bir dönemde tüm ödevlerini zamanında tamamlayan öğrenci',
    category: 'academic',
    icon: 'bee',
    criteria: 'Bir dönemde tüm ödevleri zamanında tamamlamak'
  },
  {
    name: 'Süper Öğrenci',
    description: 'Genel not ortalaması 90 ve üzeri olan öğrenci',
    category: 'academic',
    icon: 'star',
    criteria: 'Genel not ortalaması 90 ve üzeri olmak'
  },
  {
    name: 'Yardımsever',
    description: 'Arkadaşlarına akademik konularda yardım eden öğrenci',
    category: 'social',
    icon: 'helping-hand',
    criteria: 'Arkadaşlarına akademik konularda yardım etmek'
  },
  {
    name: 'Lider Ruh',
    description: 'Grup projelerinde liderlik yapan öğrenci',
    category: 'social',
    icon: 'crown',
    criteria: 'Grup projelerinde liderlik yapmak'
  },
  {
    name: 'Yaratıcı Düşünür',
    description: 'Özgün fikirler ve projeler üreten öğrenci',
    category: 'social',
    icon: 'lightbulb',
    criteria: 'Özgün fikirler ve projeler üretmek'
  },
  {
    name: 'Aktif Katılımcı',
    description: 'Derslerde sürekli söz alan ve tartışmalara katılan öğrenci',
    category: 'participation',
    icon: 'hand-raised',
    criteria: 'Derslerde sürekli söz almak ve tartışmalara katılmak'
  },
  {
    name: 'Gönüllü',
    description: 'Okul etkinliklerinde gönüllü olan öğrenci',
    category: 'participation',
    icon: 'heart',
    criteria: 'Okul etkinliklerinde gönüllü olmak'
  },
  {
    name: 'Spor Yıldızı',
    description: 'Okul spor takımlarında yer alan öğrenci',
    category: 'participation',
    icon: 'trophy',
    criteria: 'Okul spor takımlarında yer almak'
  }
]

async function createBadges() {
  try {
    await connectToDatabase()
    
    for (const badge of badges) {
      const existingBadge = await Badge.findOne({ name: badge.name })
      if (!existingBadge) {
        await Badge.create(badge)
        console.log(`Created badge: ${badge.name}`)
      } else {
        console.log(`Badge already exists: ${badge.name}`)
      }
    }

    console.log('All badges have been created or already exist.')
  } catch (error) {
    console.error('Error creating badges:', error)
  } finally {
    process.exit(0)
  }
}

createBadges()

