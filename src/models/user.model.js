import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const collection = 'users';

const schema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  age: { type: Number, required: true },
  password: { type: String, required: true, minlength: 6 },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Carts' },
  role: { type: String, default: 'user', enum: ['user', 'admin', 'premium'] }
});


const UserModel = mongoose.models.users || mongoose.model(collection, schema);
export default UserModel;