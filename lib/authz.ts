import { auth } from '@/auth';
import { getDb } from './db';

export interface SessionUser {
  id: string; // Canonical NextAuth user.id (Mongo ObjectId string)
  email: string;
  name: string;
  image?: string;
  role: 'user' | 'admin';
}

export interface VerifiedStudent extends SessionUser {
  studentProfile: {
    user_id: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    country?: string;
    fieldOfStudy?: string;
    university?: string;
    department?: string;
    docs?: any[];
    createdAt: string;
    updatedAt: string;
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  const user = session.user as any;
  return {
    id: user.id,
    email: user.email!,
    name: user.name!,
    image: user.image,
    role: user.role || 'user',
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(allowedRoles: string[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role)) {
    const error: any = new Error('Forbidden');
    error.statusCode = 403;
    error.message = 'Insufficient permissions';
    throw error;
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(['admin']);
}

export async function requireVerifiedStudent(): Promise<VerifiedStudent> {
  const user = await requireUser();
  
  if (user.role === 'admin') {
    return {
      ...user,
      studentProfile: null as any,
    };
  }

  const db = await getDb();
  const studentProfile = await db.collection('student_profiles').findOne(
    { user_id: user.id },
    { projection: { _id: 0 } }
  );
  
  if (!studentProfile) {
    throw new Error('STUDENT_PROFILE_NOT_FOUND');
  }

  const verificationStatus = studentProfile.verificationStatus || studentProfile.verification_status;
  if (verificationStatus !== 'verified') {
    throw new Error(`STUDENT_NOT_VERIFIED: ${verificationStatus || 'pending'}`);
  }

  return {
    ...user,
    studentProfile: {
      user_id: studentProfile.user_id,
      verificationStatus: verificationStatus as 'pending' | 'verified' | 'rejected',
      country: studentProfile.country,
      fieldOfStudy: studentProfile.fieldOfStudy || studentProfile.field_of_study,
      university: studentProfile.university,
      department: studentProfile.department,
      docs: studentProfile.docs || studentProfile.verification_documents,
      createdAt: studentProfile.createdAt || studentProfile.created_at,
      updatedAt: studentProfile.updatedAt || studentProfile.updated_at,
    },
  };
}
