import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { hashPassword, comparePassword } from '../../utils/hash';
import { signAuthToken } from '../../utils/jwt';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(6, 'Phone number must be at least 6 digits').max(20),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Safe User Shape (never expose passwordHash) ─────────────────────────────

function safeUser(user: {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}) {
  return {
    id: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

// ─── Service Functions ────────────────────────────────────────────────────────

export async function registerUser(input: RegisterInput) {
  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(input.password);

  // Only the designated admin email gets the ADMIN role.
  // Every other self-registration is always STUDENT.
  const ADMIN_EMAILS = ['tiyamandal890@gmail.com'];
  const role = ADMIN_EMAILS.includes(input.email.toLowerCase()) ? 'ADMIN' : 'STUDENT';

  // Role is determined server-side — never trust client input
  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role,
    },
  });

  const token = signAuthToken({
    sub: user.userId,
    role: user.role,
    email: user.email,
  });

  return { user: safeUser(user), token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' };
  }

  if (!user.isActive) {
    throw { code: 'ACCOUNT_DISABLED', message: 'Your account has been disabled. Please contact an administrator.' };
  }

  const passwordMatch = await comparePassword(input.password, user.passwordHash);

  if (!passwordMatch) {
    throw { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' };
  }

  const token = signAuthToken({
    sub: user.userId,
    role: user.role,
    email: user.email,
  });

  return { user: safeUser(user), token };
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { userId },
  });

  if (!user || !user.isActive) {
    throw { code: 'USER_NOT_FOUND', message: 'User not found.' };
  }

  return safeUser(user);
}
