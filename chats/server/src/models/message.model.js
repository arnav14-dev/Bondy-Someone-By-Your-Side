import mongoose from 'mongoose';
import User from '../../../../backend/src/models/user.model.js';


const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;