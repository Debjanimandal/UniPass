import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { hashPassword } from '../../utils/hash';

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const CreateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(6, 'Phone number must be at least 6 digits').max(20),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  role: z.nativeEnum(Role).default(Role.STUDENT),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().min(6).max(20).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// ─── Shaping (never expose passwordHash) ───────────────────────────────────────

type UserWithCounts = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  _count?: { tickets: number };
};

function shapeUser(u: UserWithCounts) {
  return {
    id: u.userId,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    bookings: u._count?.tickets ?? 0,
  };
}

// ─── Services ───────────────────────────────────────────────────────────────

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { tickets: true } },
    },
  });

  const shaped = users.map(shapeUser);

  const stats = {
    total: shaped.length,
    students: shaped.filter((u) => u.role === 'STUDENT').length,
    guards: shaped.filter((u) => u.role === 'GUARD').length,
    admins: shaped.filter((u) => u.role === 'ADMIN').length,
    active: shaped.filter((u) => u.isActive).length,
    inactive: shaped.filter((u) => !u.isActive).length,
  };

  return { users: shaped, stats };
}

export async function getUserDetail(userId: number) {
  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      _count: { select: { tickets: true } },
      tickets: {
        include: {
          screening: { select: { date: true } },
        },
      },
    },
  });

  if (!user) throw { code: 'NOT_FOUND', message: 'User not found.' };

  const now = Date.now();
  const upcoming = user.tickets.filter(
    (t) => t.status !== 'CANCELLED' && new Date(t.screening.date).getTime() >= now
  ).length;
  const completed = user.tickets.filter(
    (t) => t.status === 'SCANNED' || new Date(t.screening.date).getTime() < now
  ).length;

  return {
    ...shapeUser(user),
    upcomingTickets: upcoming,
    completedEvents: completed,
  };
}

export async function createUser(input: CreateUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role,
    },
    include: { _count: { select: { tickets: true } } },
  });

  return shapeUser(user);
}

export async function updateUser(userId: number, input: UpdateUserInput) {
  const existing = await prisma.user.findUnique({ where: { userId } });
  if (!existing) throw { code: 'NOT_FOUND', message: 'User not found.' };

  const data: Record<string, unknown> = {};
  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastName = input.lastName;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.role !== undefined) data.role = input.role;
  if (input.isActive !== undefined) data.isActive = input.isActive;

  const user = await prisma.user.update({
    where: { userId },
    data,
    include: { _count: { select: { tickets: true } } },
  });

  return shapeUser(user);
}
