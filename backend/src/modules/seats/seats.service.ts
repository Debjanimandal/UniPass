import { SeatType } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../config/prisma';

export const BulkCreateSeatsSchema = z.object({
  screenId: z.number().int().positive(),
  rows: z.number().int().min(1).max(26),
  seatsPerRow: z.number().int().min(1).max(50),
});

export const UpdateSeatSchema = z.object({
  seatType: z.nativeEnum(SeatType).optional(),
  isActive: z.boolean().optional(),
});

type BulkCreateSeatsInput = z.infer<typeof BulkCreateSeatsSchema>;
type UpdateSeatInput = z.infer<typeof UpdateSeatSchema>;

export async function getSeatsByScreenId(screenId: number) {
  return prisma.seat.findMany({
    where: { screenId },
    orderBy: [
      { rowNo: 'asc' },
      { seatNo: 'asc' }
    ]
  });
}

export async function getSeatById(seatId: number) {
  const seat = await prisma.seat.findUnique({ where: { seatId } });
  if (!seat) throw { code: 'NOT_FOUND', message: 'Seat not found.' };
  return seat;
}

export async function generateSeatLayout(data: BulkCreateSeatsInput) {
  const screen = await prisma.screen.findUnique({ where: { screenId: data.screenId } });
  if (!screen) throw { code: 'NOT_FOUND', message: 'Screen not found.' };

  // Check if any tickets exist for this screen first
  const existingTickets = await prisma.ticket.findFirst({
    where: { seat: { screenId: data.screenId } }
  });
  
  if (existingTickets) {
    throw { code: 'VALIDATION_ERROR', message: 'Cannot generate new layout. There are existing tickets booked for this screen.' };
  }

  await prisma.seat.deleteMany({ where: { screenId: data.screenId } });

  const newSeats = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let r = 0; r < data.rows; r++) {
    const rowLetter = alphabet[r];
    for (let c = 1; c <= data.seatsPerRow; c++) {
      newSeats.push({
        screenId: data.screenId,
        rowNo: r + 1,
        seatNo: c,
        seatCode: `${rowLetter}${c}`,
        seatType: SeatType.REGULAR,
        isActive: true,
      });
    }
  }

  return prisma.seat.createMany({
    data: newSeats
  });
}

export async function updateSeat(seatId: number, data: UpdateSeatInput) {
  await getSeatById(seatId);
  return prisma.seat.update({
    where: { seatId },
    data
  });
}

export async function deleteSeat(seatId: number) {
  const seat = await getSeatById(seatId);
  
  // check for bookings
  const ticket = await prisma.ticket.findFirst({ where: { seatId } });
  if (ticket) {
    throw { code: 'VALIDATION_ERROR', message: 'Cannot delete seat because it has existing bookings.' };
  }

  return prisma.seat.delete({ where: { seatId } });
}
