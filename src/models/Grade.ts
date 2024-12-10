import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  value: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

export const Grade = mongoose.models.Grade || mongoose.model('Grade', gradeSchema);

