import { Router, Response, NextFunction } from 'express';
import { sign as cryptoSign, createPrivateKey } from 'crypto';
import type { ApiResponse } from '@hypervault/shared';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Wallet } from '../models/Wallet';
import { generateEd25519KeyPair } from '../crypto/keypair';
import { encrypt, decrypt, generateKdfSalt } from '../crypto/encryption';
import { config } from '../config';
import { signMessageSchema } from '../schemas/validation';

const router = Router();

// All wallet routes require auth
router.use(authMiddleware);

// POST /wallets — create new wallet
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { publicKey, privateKey } = generateEd25519KeyPair();

    // Encrypt private key with random per-wallet salt
    const kdfSalt = generateKdfSalt();
    const encryptedPrivateKey = encrypt(privateKey, config.masterEncryptionKey, kdfSalt);

    const wallet = await Wallet.create({
      userId,
      publicKey,
      encryptedPrivateKey,
      kdfSalt,
    });

    const response: ApiResponse<{ walletId: string; publicKey: string }> = {
      success: true,
      data: { walletId: wallet._id.toString(), publicKey },
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

// GET /wallets/me — list my wallets
router.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const wallets = await Wallet.find({ userId: req.user!.userId })
      .select('-encryptedPrivateKey -kdfSalt -__v')
      .lean();

    const formatted = wallets.map(w => ({
      ...w,
      balance: w.balance?.toString() || '0',
    }));

    const response: ApiResponse<typeof formatted> = { success: true, data: formatted };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// GET /wallets/:walletId/balance — get balance (ownership check)
router.get('/:walletId/balance', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const wallet = await Wallet.findById(req.params.walletId);
    if (!wallet) {
      res.status(404).json({ success: false, error: 'Wallet not found' } as ApiResponse);
      return;
    }
    if (wallet.userId.toString() !== req.user!.userId) {
      res.status(403).json({ success: false, error: 'Forbidden' } as ApiResponse);
      return;
    }

    const response: ApiResponse<{ walletId: string; balance: string }> = {
      success: true,
      data: {
        walletId: wallet._id.toString(),
        balance: wallet.balance?.toString() || '0',
      },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// POST /wallets/:walletId/sign — sign a message (ownership check)
router.post('/:walletId/sign', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message } = signMessageSchema.parse(req.body);

    const wallet = await Wallet.findById(req.params.walletId);
    if (!wallet) {
      res.status(404).json({ success: false, error: 'Wallet not found' } as ApiResponse);
      return;
    }
    if (wallet.userId.toString() !== req.user!.userId) {
      res.status(403).json({ success: false, error: 'Forbidden' } as ApiResponse);
      return;
    }

    // Decrypt private key into buffer
    const privateKeyHex = decrypt(
      wallet.encryptedPrivateKey,
      config.masterEncryptionKey,
      wallet.kdfSalt,
    );
    const privateKeyDer = Buffer.from(privateKeyHex, 'hex');

    // Reconstruct key object and sign with Ed25519
    const keyObject = createPrivateKey({
      key: privateKeyDer,
      format: 'der',
      type: 'pkcs8',
    });
    const signature = cryptoSign(null, Buffer.from(message), keyObject);

    // Zero out the private key buffer immediately
    privateKeyDer.fill(0);

    const response: ApiResponse<{ signature: string; publicKey: string }> = {
      success: true,
      data: {
        signature: signature.toString('hex'),
        publicKey: wallet.publicKey,
      },
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export default router;
