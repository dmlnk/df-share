const mongoose = require('mongoose');

const File = mongoose.model('File', new mongoose.Schema({
        originalname: {
            type: String,
            required: true
        },
        destination: {
            type: String,
            required: true
        },
        mimetype: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        uploadedBy: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            username: {
                type: String
            }
        },

        isPrivate: {
            type: Boolean,
            required: true
        },

        accessibleTo: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                username: {
                    type: String
                }
            }
        ]
    })
)

module.exports = File;