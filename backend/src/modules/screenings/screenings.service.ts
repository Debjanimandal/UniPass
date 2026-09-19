import { z } from 'zod';
import { prisma } from '../../config/prisma';

export const CreateScreeningSchema = z.object({
  movieId: z.number().int().positive(),
  screenId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
  price: z.number().positive(),
  isActive: z.boolean().default(true),
});

export const UpdateScreeningSchema = CreateScreeningSchema.partial();

export const BulkScreeningSchema = z.object({
  movieId: z.number().int().positive(),
  screenId: z.number().int().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  timings: z.array(
    z.object({
      startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
    })
  ).min(1, 'At least one timing is required'),
  price: z.number().positive(),
  isActive: z.boolean().default(true),
});

type CreateScreeningInput = z.infer<typeof CreateScreeningSchema>;
type UpdateScreeningInput = z.infer<typeof UpdateScreeningSchema>;
type BulkScreeningInput = z.infer<typeof BulkScreeningSchema>;

// Helper to convert "HH:mm" to a dummy Date object Prisma accepts for @db.Time
function parseTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(1970, 0, 1, hours, minutes, 0, 0);
  // Ensure UTC time for the time field to match exactly
  const utcDate = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
  return utcDate;
}

export async function getAllScreenings(filters?: {
  activeOnly?: boolean;
  movieId?: number;
  screenId?: number;
}) {
  const where: any = {};

  if (filters?.activeOnly) {
    where.isActive = true;
  }
  if (filters?.movieId) {
    where.movieId = filters.movieId;
  }
  if (filters?.screenId) {
    where.screenId = filters.screenId;
  }

  return prisma.screening.findMany({
    where,
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ],
    include: {
      movie: true,
      screen: {
        include: {
          _count: {
            select: { seats: true }
          }
        }
      },
      _count: {
        select: { tickets: true }
      }
    },
  });
}

export async function getScreeningById(screeningId: number) {
  const screening = await prisma.screening.findUnique({
    where: { screeningId },
    include: {
      movie: true,
      screen: {
        include: {
          _count: {
            select: { seats: true }
          }
        }
      },
      _count: {
        select: { tickets: true }
      }
    },
  });
  if (!screening) throw { code: 'NOT_FOUND', message: 'Screening not found.' };
  return screening;
}

export async function createScreening(data: CreateScreeningInput) {
  // Ensure movie and screen exist
  const movie = await prisma.movie.findUnique({ where: { movieId: data.movieId } });
  if (!movie) throw { code: 'NOT_FOUND', message: 'Movie not found.' };
  
  const screen = await prisma.screen.findUnique({ where: { screenId: data.screenId } });
  if (!screen) throw { code: 'NOT_FOUND', message: 'Screen not found.' };

  return prisma.screening.create({
    data: {
      movieId: data.movieId,
      screenId: data.screenId,
      date: new Date(data.date), // Creates a Date object at midnight UTC
      startTime: parseTime(data.startTime),
      endTime: parseTime(data.endTime),
      price: data.price,
      isActive: data.isActive,
    },
    include: {
      movie: true,
      screen: true
    }
  });
}

export async function createBulkScreenings(data: BulkScreeningInput) {
  const movie = await prisma.movie.findUnique({ where: { movieId: data.movieId } });
  if (!movie) throw { code: 'NOT_FOUND', message: 'Movie not found.' };

  const screen = await prisma.screen.findUnique({ where: { screenId: data.screenId } });
  if (!screen) throw { code: 'NOT_FOUND', message: 'Screen not found.' };

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  
  if (startDate > endDate) {
    throw { code: 'VALIDATION_ERROR', message: 'Start date cannot be after end date.' };
  }

  const newScreenings = [];

  // Loop through every day from startDate to endDate
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const currentIsoDate = d.toISOString();
    
    for (const time of data.timings) {
      newScreenings.push({
        movieId: data.movieId,
        screenId: data.screenId,
        date: new Date(currentIsoDate), // create a new Date instance for each entry
        startTime: parseTime(time.startTime),
        endTime: parseTime(time.endTime),
        price: data.price,
        isActive: data.isActive,
      });
    }
  }

  // Bulk create in a transaction
  return prisma.$transaction(
    newScreenings.map(screening => prisma.screening.create({ data: screening }))
  );
}

export async function updateScreening(screeningId: number, data: UpdateScreeningInput) {
  await getScreeningById(screeningId);

  const updateData: any = { ...data };
  if (data.date) updateData.date = new Date(data.date);
  if (data.startTime) updateData.startTime = parseTime(data.startTime);
  if (data.endTime) updateData.endTime = parseTime(data.endTime);

  return prisma.screening.update({
    where: { screeningId },
    data: updateData,
  });
}

export async function deleteScreening(screeningId: number) {
  await getScreeningById(screeningId);

  return prisma.screening.delete({
    where: { screeningId },
  });
}
