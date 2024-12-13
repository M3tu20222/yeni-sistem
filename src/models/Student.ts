import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { Grade } from './Grade';

interface IStudent extends Document {
  studentNo: string;
  name: string;
  email: string;
  password: string;
  classId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  gradeAverages: Map<string, number>;
  overallAverage: number;
  points: number;
  badges: string[];
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  calculateAverages: () => Promise<void>;
}

const studentSchema = new mongoose.Schema<IStudent>({
  studentNo: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  gradeAverages: {
    type: Map,
    of: Number,
    default: new Map()
  },
  overallAverage: {
    type: Number,
    default: 0
  },
  points: { 
    type: Number, 
    default: 0 
  },
  badges: [{ 
    type: String 
  }],
});

studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

studentSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

studentSchema.methods.calculateAverages = async function(): Promise<void> {
  const grades = await Grade.find({ studentId: this._id });
  const courseAverages = new Map<string, { sum: number; count: number }>();
  let totalSum = 0;
  let totalCount = 0;

  grades.forEach((grade: { courseId: mongoose.Types.ObjectId; value: number }) => {
    const courseId = grade.courseId.toString();
    if (!courseAverages.has(courseId)) {
      courseAverages.set(courseId, { sum: 0, count: 0 });
    }
    const courseData = courseAverages.get(courseId);
    if (courseData) {
      courseData.sum += grade.value;
      courseData.count += 1;
      totalSum += grade.value;
      totalCount += 1;
    }
  });

  courseAverages.forEach((data, courseId) => {
    this.gradeAverages.set(courseId, data.sum / data.count);
  });

  this.overallAverage = totalCount > 0 ? totalSum / totalCount : 0;
  await this.save();
};

export const Student = mongoose.model<IStudent>('Student', studentSchema);

