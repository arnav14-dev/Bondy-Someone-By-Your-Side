import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    contactNumber:{
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 10
    },
    password:{
        type: String,
        required: true,
        minlength: 8,  
        maxlength: 50,
    },
    profilePicture:{
        type: String,
    },
    profilePictureOriginalName:{
        type: String,
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    updatedAt:{
        type: Date,
        default: Date.now()
    }
});

// pre-save hook
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model('User', userSchema);

export default User;