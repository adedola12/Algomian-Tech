import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name        : { type: String, required: true },
  industry    : { type: String },
  owner       : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps:true });

export default mongoose.model('Store', storeSchema);
