import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWallet extends Document {
  userId: Types.ObjectId;
  publicKey: string;
  encryptedPrivateKey: {
    ciphertext: string;
    iv: string;
    authTag: string;
  };
  kdfSalt: string;
  balance: Types.Decimal128;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    encryptedPrivateKey: {
      ciphertext: { type: String, required: true },
      iv: { type: String, required: true },
      authTag: { type: String, required: true },
    },
    kdfSalt: {
      type: String,
      required: true,
    },
    balance: {
      type: Schema.Types.Decimal128,
      default: 0,
    },
  },
  { timestamps: true },
);

WalletSchema.index({ userId: 1 });

// Never return encryptedPrivateKey or kdfSalt in JSON
WalletSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.encryptedPrivateKey;
    delete ret.kdfSalt;
    delete ret.__v;
    if (ret.balance) {
      ret.balance = ret.balance.toString();
    }
    return ret;
  },
});

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
