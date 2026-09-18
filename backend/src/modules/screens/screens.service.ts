import { z } from 'zod';
import { prisma } from '../../config/prisma';

export const CreateScreenSchema = z.object({
  screenName: z.string().min(1, 'Screen name is required'),
  venue: z.string().min(1, 'Venue is required'),
  description: z.string().min(1, 'Description is required'),
  isActive: z.boolean().default(true),
});

export const UpdateScreenSchema = CreateScreenSchema.partial();

type CreateScreenInput = z.infer<typeof CreateScreenSchema>;
type UpdateScreenInput = z.infer<typeof UpdateScreenSchema>;

export async function getAllScreens(filters?: {
  activeOnly?: boolean;
  search?: string;
  venue?: string;
}) {
  const where: any = {};

  if (filters?.activeOnly) {
    where.isActive = true;
  }
  
  if (filters?.search) {
    where.OR = [
      { screenName: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters?.venue) {
    where.venue = filters.venue;
  }

  return prisma.screen.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { seats: true, screenings: true },
      },
    },
  });
}

export async function getScreenById(screenId: number) {
  const screen = await prisma.screen.findUnique({
    where: { screenId },
    include: {
      _count: {
        select: { seats: true, screenings: true },
      },
    },
  });
  if (!screen) throw { code: 'NOT_FOUND', message: 'Screen not found.' };
  return screen;
}

export async function createScreen(data: CreateScreenInput) {
  return prisma.screen.create({
    data,
  });
}

export async function updateScreen(screenId: number, data: UpdateScreenInput) {
  // Check if exists
  await getScreenById(screenId);

  return prisma.screen.update({
    where: { screenId },
    data,
  });
}

export async function deleteScreen(screenId: number) {
  // Check if exists
  await getScreenById(screenId);

  // You might want to prevent deletion if there are seats or screenings attached,
  // but Prisma will throw a foreign key constraint error if we don't cascade.
  return prisma.screen.delete({
    where: { screenId },
  });
}
