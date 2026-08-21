import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  node_id: { 
    type: Number, 
    required: true 
  },
  alert_type: { 
    type: String, 
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['Info', 'Warning', 'Critical'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Active', 'Resolved'], 
    default: 'Active' 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Alert', AlertSchema);
