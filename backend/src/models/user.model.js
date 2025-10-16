import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
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
    governmentId:{
        type: String,
        required: false,
        unique: true,
        sparse: true, // Allows multiple null values
        minlength: 10,
        maxlength: 20,
        default: undefined
    },
    governmentIdType:{
        type: String,
        required: true,
        enum: ['Aadhaar', 'PAN', 'Voter ID', 'Driving License']
    },
    profilePicture:{
        type: String,
    },
    profilePictureOriginalName:{
        type: String,
    },
    idVerificationMethod:{
        type: String,
        required: true,
        enum: ['number', 'image']
    },
    idImage:{
        type: String,
        required: false,
    },
    idImageOriginalName:{
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

// indexing - removed duplicate indexes since they're already defined in schema fields

// pre-save hook
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model('User', userSchema);

export default User;