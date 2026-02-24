import bcrypt from 'bcryptjs';
import { getDb } from './db';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export type AccountType = 'student' | 'donor' | 'mentor' | 'parent' | 'teacher' | 'school';

export const VALID_ACCOUNT_TYPES: AccountType[] = ['student', 'donor', 'mentor', 'parent', 'teacher', 'school'];

export interface UserRecord {
  _id?: ObjectId;
  email?: string;
  phone?: string;
  name?: string;
  password?: string;
  image?: string;
  role: string;
  accountType?: AccountType;
  provider: 'credentials' | 'google' | 'phone';
  emailVerified?: Date | null;
  phoneVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  const db = await getDb();
  return db.collection('users').findOne({ email: email.toLowerCase() });
}

/**
 * Find user by phone number
 */
export async function findUserByPhone(phone: string) {
  const db = await getDb();
  return db.collection('users').findOne({ phone: normalizePhone(phone) });
}

/**
 * Create a new user with email + password
 */
export async function createUserWithEmail(email: string, password: string, name: string, accountType?: AccountType) {
  const db = await getDb();
  const hashedPassword = await hashPassword(password);
  
  const user: UserRecord = {
    email: email.toLowerCase(),
    name,
    password: hashedPassword,
    role: 'user',
    accountType: accountType || 'student',
    provider: 'credentials',
    emailVerified: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('users').insertOne(user);
  return { ...user, _id: result.insertedId.toString() };
}

/**
 * Create or find user by phone number
 */
export async function findOrCreateUserByPhone(phone: string) {
  const db = await getDb();
  const normalizedPhone = normalizePhone(phone);
  
  let user = await db.collection('users').findOne({ phone: normalizedPhone });
  
  if (!user) {
    const newUser: UserRecord = {
      phone: normalizedPhone,
      name: `User ${normalizedPhone.slice(-4)}`,
      role: 'user',
      accountType: 'student',
      provider: 'phone',
      phoneVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('users').insertOne(newUser);
    user = { ...newUser, _id: result.insertedId };
  }
  
  return user;
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Store OTP in database with expiration
 */
export async function storeOTP(phone: string, otp: string) {
  const db = await getDb();
  const normalizedPhone = normalizePhone(phone);
  
  await db.collection('otp_codes').deleteMany({ phone: normalizedPhone });
  
  await db.collection('otp_codes').insertOne({
    phone: normalizedPhone,
    code: otp,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    attempts: 0,
  });
}

/**
 * Verify OTP code
 */
export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  const db = await getDb();
  const normalizedPhone = normalizePhone(phone);
  
  const otpRecord = await db.collection('otp_codes').findOne({
    phone: normalizedPhone,
    code,
    expiresAt: { $gt: new Date() },
  });
  
  if (!otpRecord) {
    // Increment attempts for rate limiting
    await db.collection('otp_codes').updateOne(
      { phone: normalizedPhone },
      { $inc: { attempts: 1 } }
    );
    return false;
  }
  
  // Check max attempts
  if (otpRecord.attempts >= 5) {
    return false;
  }
  
  // Delete used OTP
  await db.collection('otp_codes').deleteMany({ phone: normalizedPhone });
  
  return true;
}

/**
 * Normalize phone number - remove spaces, dashes
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '').trim();
}
