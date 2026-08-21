import mongoose from 'mongoose';

const FarmSchema = new mongoose.Schema({
  farm_name: { 
    type: String, 
    required: true 
  },
  location_gps: { 
    type: String, 
    required: true 
  },
  total_area_hectares: { 
    type: Number, 
    required: true 
  },
  farmer_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Farmer', 
    required: true 
  }
});

export default mongoose.model('Farm', FarmSchema);
