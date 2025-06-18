import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  uploads: [{
    url: String,
    mimeType: String,
    uuid: String
  }],
  messageType: {
    type: String,
    enum: ['chat', 'code'],
    default: 'chat'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
chatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);