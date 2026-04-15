import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Index already created by `unique: true` on the email field

// Never return passwordHash in JSON
UserSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
