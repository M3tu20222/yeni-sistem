import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: {
    type: String,
    enum: ['academic', 'social', 'participation'],
    required: true
  },
  icon: { 
    type: String, 
    required: true 
  },
  criteria: { 
    type: String, 
    required: true 
  },
});

export const Badge = mongoose.models.Badge || mongoose.model('Badge', badgeSchema);

