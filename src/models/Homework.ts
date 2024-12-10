import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: true 
  },
  classId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Class', 
    required: true 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  submissions: [{
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student' 
    },
    submittedAt: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      enum: ['submitted', 'late'], 
      required: true 
    }
  }]
});

export const Homework = mongoose.models.Homework || mongoose.model('Homework', homeworkSchema);

