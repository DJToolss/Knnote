import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password should be at least 6 characters'],
    select: false, // Don't include password in query results by default
  },
  resetToken: {
    type: String,
    select: false, // Don't include in query results by default
  },
  resetTokenExpiry: {
    type: Date,
    select: false, // Don't include in query results by default
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to check if password matches
UserSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const ProjectFieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'password', 'link', 'number', 'date'],
    required: true,
  },
  required: { type: Boolean, default: false },
}, { _id: false });

const ItemSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: String,
  notes: String,
  points: Number,
  links: [String],
  images: [String],
  targetDate: { type: Date },
  status: { type: String, default: 'ETS' },
  values: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: true });

const TodoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    default: 'Untitled Todo'
  },
  items: [ItemSchema],
  fields: [ProjectFieldSchema],
  statusOptions: [String],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

if (mongoose.models.Item) {
  mongoose.deleteModel('Item');
}
if (mongoose.models.Todo) {
  mongoose.deleteModel('Todo');
}

export const Todo = mongoose.model('Todo', TodoSchema);
export const Item = mongoose.model('Item', ItemSchema);
