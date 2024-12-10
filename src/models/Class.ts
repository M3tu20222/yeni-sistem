import mongoose from 'mongoose';
import { Student } from './Student';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  teachers: [{
    subject: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  }],
  courseAverages: {
    type: Map,
    of: Number,
    default: {}
  }
});

classSchema.methods.calculateCourseAverages = async function() {
  const students = await Student.find({ classId: this._id });
  const courseAverages = new Map();

  for (const student of students) {
    for (const [courseId, average] of Object.entries(student.gradeAverages)) {
      if (!courseAverages.has(courseId)) {
        courseAverages.set(courseId, { sum: 0, count: 0 });
      }
      const courseData = courseAverages.get(courseId);
      if (courseData) {
        courseData.sum += average as number;
        courseData.count += 1;
      }
    }
  }

  for (const [courseId, data] of courseAverages.entries()) {
    this.courseAverages.set(courseId, data.sum / data.count);
  }

  await this.save();
};

export const Class = mongoose.models.Class || mongoose.model('Class', classSchema);

