import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  teacher: string;
  students: string[];
  courseAverages: Map<string, number>;
  calculateCourseAverages: () => void;
}

const ClassSchema: Schema = new Schema({
  name: { type: String, required: true },
  teacher: { type: String, required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  courseAverages: {
    type: Map,
    of: Number,
    default: new Map()
  }
});

ClassSchema.methods.calculateCourseAverages = function() {
  const courseAverages = new Map<string, { sum: number; count: number }>();

  this.students.forEach((student: any) => {
    student.grades.forEach((grade: { course: string; score: number }) => {
      if (!courseAverages.has(grade.course)) {
        courseAverages.set(grade.course, { sum: 0, count: 0 });
      }
      const data = courseAverages.get(grade.course)!;
      data.sum += grade.score;
      data.count += 1;
    });
  });

  this.courseAverages.clear();
  courseAverages.forEach((data, courseId) => {
    this.courseAverages.set(courseId, data.sum / data.count);
  });
};

export default mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);

