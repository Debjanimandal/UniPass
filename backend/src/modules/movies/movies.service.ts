import { z } from 'zod';
import { prisma } from '../../config/prisma';

// ─── Validation Schemas ───────────────────────────────────────────────────────

export const CreateMovieSchema = z.object({
  title:           z.string().min(1, 'Title is required').max(200),
  description:     z.string().min(1, 'Description is required'),
  durationMinutes: z.number().int().positive('Duration must be a positive number'),
  language:        z.string().min(1, 'Language is required'),
  genre:           z.string().min(1, 'Genre is required'),
  posterUrl:       z.string().url('Poster URL must be a valid URL'),
  isActive:        z.boolean().optional().default(true),
});

export const UpdateMovieSchema = CreateMovieSchema.partial();

export type CreateMovieInput = z.infer<typeof CreateMovieSchema>;
export type UpdateMovieInput = z.infer<typeof UpdateMovieSchema>;

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getAllMovies(activeOnly = false) {
  return prisma.movie.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { screenings: true } },
    },
  });
}

export async function getMovieById(movieId: number) {
  const movie = await prisma.movie.findUnique({
    where: { movieId },
    include: {
      _count: { select: { screenings: true } },
    },
  });
  if (!movie) throw { code: 'NOT_FOUND', message: 'Movie not found.' };
  return movie;
}

export async function createMovie(input: CreateMovieInput) {
  return prisma.movie.create({ data: input });
}

export async function updateMovie(movieId: number, input: UpdateMovieInput) {
  await getMovieById(movieId); // throws if not found
  return prisma.movie.update({ where: { movieId }, data: input });
}

export async function deleteMovie(movieId: number) {
  await getMovieById(movieId); // throws if not found
  // Delete linked screenings first to avoid FK constraint
  await prisma.screening.deleteMany({ where: { movieId } });
  return prisma.movie.delete({ where: { movieId } });
}
