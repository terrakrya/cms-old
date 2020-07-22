const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const ObjectId = mongoose.Schema.Types.ObjectId

const PostSchema = mongoose.Schema({
  site: {
    type: ObjectId,
    ref: 'Site',
    required: true
  },
  slug: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  content: String,
  picture: Object,
  tags: [{
    type: ObjectId,
    ref: 'Tag'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

PostSchema.plugin(uniqueValidator, {
  message: 'já está sendo usado'
})

export const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)