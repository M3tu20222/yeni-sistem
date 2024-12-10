import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Grade } from './Grade';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subject: { type: String, required: true },
  classes: [{ type: String }],
  grades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Grade' }]
});

// Şifre karşılaştırma metodu
teacherSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

teacherSchema.methods.getStudentGrades = async function(studentId: mongoose.Types.ObjectId) {
  return await Grade.find({ teacherId: this._id, studentId: studentId });
};

export const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);

