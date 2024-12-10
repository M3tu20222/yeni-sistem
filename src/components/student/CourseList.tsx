import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Course {
  _id: string
  name: string
  average: number | null
}

interface CourseListProps {
  courses: Course[]
  onSelectCourse: (courseId: string) => void
}

export default function CourseList({ courses, onSelectCourse }: CourseListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course._id} className="bg-slate-800/50 border-2 border-neon-blue hover:border-neon-purple transition-colors">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-neon-pink">{course.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              Ortalama: 
              <span className="font-bold ml-2 text-neon-yellow">
                {course.average !== null ? course.average.toFixed(2) : 'N/A'}
              </span>
            </p>
            <Button 
              onClick={() => onSelectCourse(course._id)}
              className="w-full bg-neon-blue hover:bg-neon-purple text-white transition-colors"
            >
              Notları Görüntüle
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

