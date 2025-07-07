import mongoose from "mongoose";
import { Role, RoleEnum } from "../validators/user.schema";

//this is for ts 
export interface IUser extends mongoose.Document{
    _id: mongoose.Types.ObjectId,
    username?: string,
    email: string,
    password: string,
    role: Role,

    isVerified: boolean,    //email verification
    verificationToken?: string;  
    verificationTokenExpires?: Date,

    wantsEmails: boolean, //subscribe for emails

    resetPasswordToken?: string,//for password reset
    resetPasswordExpires?: Date,

    otpCode?: string,//for password reset
    otpCodeExpires?: Date,

    createdAt?:Date,
    updatedAt?:Date,
}

const UserSchema = new mongoose.Schema<IUser>({
 username:{
        type: String,
        trim: true,
        default: "un_known"
    },
    email:{
        type: String,
        required : true,
        trim: true,
    },
    password:{
        type: String,
        required : true,
    },

    role:{
        type: String,
        required : true,
        enum: RoleEnum.options, 
        default: "reader",
    },

    //email verification
    isVerified:{type: Boolean, default: false,},
    verificationToken: {type: String},
    verificationTokenExpires: { type: Date },

    //for system updates allow emails?
    wantsEmails: { type: Boolean, default: true},

    //for password resets
    resetPasswordToken:{type: String},
    resetPasswordExpires: { type: Date },

    otpCode:{type: String},
    otpCodeExpires: { type: Date }


}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
export default User;

