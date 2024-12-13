import mongoose, { Schema, Document } from 'mongoose';

interface StudentGrade {
  courseId: string;
  value: number;
}

interface StudentWithGrades {
  grades?: StudentGrade[];
}

export interface IClass extends Document {
  name: string;
  teacher: string;
  students: mongoose.Types.ObjectId[];
  grade: number;
  section: string;
  courseAverages: Map<string, number>;
  calculateCourseAverages: () => Promise<void>;
}

const ClassSchema: Schema = new Schema<IClass>({
  name: { type: String, required: true },
  teacher: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  grade: { type: Number, required: true },
  section: { type: String, required: true },
  courseAverages: {
    type: Map,
    of: Number,
    default: new Map()
  }
});

ClassSchema.methods.calculateCourseAverages = async function() {
  const courseAverages = new Map<string, { sum: number; count: number }>();

  // Fetch and populate the students with their grades
  await this.populate({
    path: 'students',
    select: 'grades'
  });

  this.students.forEach((student: StudentWithGrades) => {
    if (student.grades && Array.isArray(student.grades)) {
      student.grades.forEach((grade: StudentGrade) => {
        if (!courseAverages.has(grade.courseId)) {
          courseAverages.set(grade.courseId, { sum: 0, count: 0 });
        }
        const data = courseAverages.get(grade.courseId)!;
        data.sum += grade.value;
        data.count += 1;
      });
    }
  });

  this.courseAverages.clear();
  courseAverages.forEach((data, courseId) => {
    this.courseAverages.set(courseId, data.sum / data.count);
  });

  await this.save();
};

export const Class = mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);

