import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { signQRCredential } from '../../utils/jwt';
import QRCode from 'qrcode';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const BookTicketSchema = z.object({
  screeningId: z.number().int().positive(),
  seatId: z.number().int().positive(),
});

export type BookTicketInput = z.infer<typeof BookTicketSchema>;

// ─── Service: Get all seats + availability for a screening ───────────────────

/**
 * Returns the complete seat map for a screening's screen,
 * annotating each seat with whether it's already booked.
 */
export async function getScreeningSeats(screeningId: number) {
  // Fetch the screening (to know which screen + date/time)
  const screening = await prisma.screening.findUnique({
    where: { screeningId },
    include: {
      movie: { select: { title: true, durationMinutes: true } },
      screen: { select: { screenId: true, screenName: true, venue: true } },
    },
  });

  if (!screening) throw new Error('SCREENING_NOT_FOUND');
  if (!screening.isActive) throw new Error('SCREENING_INACTIVE');

  // Fetch all physical seats on this screen
  const allSeats = await prisma.seat.findMany({
    where: { screenId: screening.screen.screenId, isActive: true },
    orderBy: [{ rowNo: 'asc' }, { seatNo: 'asc' }],
  });

  // Fetch all already-booked seat IDs for THIS screening (exclude CANCELLED)
  const bookedTickets = await prisma.ticket.findMany({
    where: {
      screeningId,
      status: { not: 'CANCELLED' },
    },
    select: { seatId: true },
  });

  const bookedSeatIds = new Set(bookedTickets.map((t) => t.seatId));

  // Annotate each seat with availability
  const seatMap = allSeats.map((seat) => ({
    seatId: seat.seatId,
    seatCode: seat.seatCode,
    rowNo: seat.rowNo,
    seatNo: seat.seatNo,
    seatType: seat.seatType,
    isBooked: bookedSeatIds.has(seat.seatId),
  }));

  return {
    screening: {
      screeningId: screening.screeningId,
      movieTitle: screening.movie.title,
      durationMinutes: screening.movie.durationMinutes,
      screenName: screening.screen.screenName,
      venue: screening.screen.venue,
      date: screening.date,
      startTime: screening.startTime,
      endTime: screening.endTime,
      price: screening.price,
    },
    seats: seatMap,
    totalSeats: allSeats.length,
    bookedSeats: bookedSeatIds.size,
    availableSeats: allSeats.length - bookedSeatIds.size,
  };
}

// ─── Service: Book a ticket ────────────────────────────────────────────────────

/**
 * Books a specific seat for a screening for the authenticated student.
 * Returns the created ticket + a QR code PNG data URL.
 *
 * The QR payload encodes: ticket_id + screening_id + seat_id + movie_title
 * + screening date/time so it can only be valid for that exact showing.
 */
export async function bookTicket(userId: number, input: BookTicketInput) {
  const { screeningId, seatId } = input;

  // 1. Verify screening exists and is active
  const screening = await prisma.screening.findUnique({
    where: { screeningId },
    include: {
      movie: { select: { movieId: true, title: true } },
      screen: { select: { screenName: true, venue: true } },
    },
  });

  if (!screening) throw new Error('SCREENING_NOT_FOUND');
  if (!screening.isActive) throw new Error('SCREENING_INACTIVE');

  // 2. Verify the seat exists and belongs to this screen
  const seat = await prisma.seat.findFirst({
    where: { seatId, screenId: screening.screenId, isActive: true },
  });

  if (!seat) throw new Error('SEAT_NOT_FOUND');

  // 3. Check the seat isn't already booked for this screening (race-safe via DB unique constraint)
  const existingTicket = await prisma.ticket.findFirst({
    where: {
      screeningId,
      seatId,
      status: { not: 'CANCELLED' },
    },
  });

  if (existingTicket) throw new Error('SEAT_ALREADY_BOOKED');

  // 4. Verify the student hasn't already booked a different seat for the same screening
  const studentDuplicate = await prisma.ticket.findFirst({
    where: {
      screeningId,
      userId,
      status: { not: 'CANCELLED' },
    },
  });

  if (studentDuplicate) throw new Error('ALREADY_BOOKED_THIS_SCREENING');

  // 5. Create the ticket (DB unique constraint on [screeningId, seatId] prevents race condition)
  let ticket;
  try {
    ticket = await prisma.ticket.create({
      data: {
        userId,
        screeningId,
        seatId,
        status: 'VALID',
      },
      include: {
        screening: {
          include: {
            movie: true,
            screen: true,
          },
        },
        seat: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  } catch (err: unknown) {
    // PostgreSQL unique violation code: 23505
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      throw new Error('SEAT_ALREADY_BOOKED');
    }
    throw err;
  }

  // 6. Build a tamper-proof QR payload using JWT signed with QR_SECRET
  //    The payload embeds ALL the identifying details so the QR is ONLY
  //    valid for this exact ticket / screening / seat combination.
  const qrPayload = {
    ticket_id: ticket.ticketId,
    screening_id: screeningId,
    user_id: userId,
    seat_id: seatId,
    seat_code: seat.seatCode,
    movie_id: screening.movie.movieId,
    movie_title: screening.movie.title,
    screening_date: screening.date.toISOString().split('T')[0],  // YYYY-MM-DD
    start_time: screening.startTime.toISOString(),
    end_time: screening.endTime.toISOString(),
    screen_name: screening.screen.screenName,
    venue: screening.screen.venue,
  };

  // Sign with QR_SECRET — long-lived but revocable via DB status check
  const qrJwt = signQRCredential(qrPayload);

  // 7. Generate the QR code as a base64 PNG data URL (ready for <img src="...">)
  const qrDataUrl = await QRCode.toDataURL(qrJwt, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  return {
    ticket: {
      ticketId: ticket.ticketId,
      status: ticket.status,
      bookedAt: ticket.bookedAt,
      seatCode: ticket.seat.seatCode,
      seatType: ticket.seat.seatType,
      movieTitle: ticket.screening.movie.title,
      screenName: ticket.screening.screen.screenName,
      venue: ticket.screening.screen.venue,
      date: ticket.screening.date,
      startTime: ticket.screening.startTime,
      endTime: ticket.screening.endTime,
      price: ticket.screening.price,
      studentName: `${ticket.user.firstName} ${ticket.user.lastName}`,
      studentEmail: ticket.user.email,
    },
    qrCode: qrDataUrl,   // Base64 PNG — frontend renders this directly
    qrToken: qrJwt,       // Raw JWT — stored for guard scanning
  };
}

// ─── Service: Get student's tickets ───────────────────────────────────────────

export async function getMyTickets(userId: number) {
  const tickets = await prisma.ticket.findMany({
    where: { userId },
    orderBy: { bookedAt: 'desc' },
    include: {
      seat: true,
      screening: {
        include: {
          movie: { select: { title: true, posterUrl: true, genre: true, durationMinutes: true } },
          screen: { select: { screenName: true, venue: true } },
        },
      },
    },
  });

  // Regenerate QR for each valid ticket
  return Promise.all(
    tickets.map(async (t) => {
      const qrPayload = {
        ticket_id: t.ticketId,
        screening_id: t.screeningId,
        user_id: t.userId,
        seat_id: t.seatId,
        seat_code: t.seat.seatCode,
        movie_id: t.screening.movieId,
        movie_title: t.screening.movie.title,
        screening_date: t.screening.date.toISOString().split('T')[0],
        start_time: t.screening.startTime.toISOString(),
        end_time: t.screening.endTime.toISOString(),
        screen_name: t.screening.screen.screenName,
        venue: t.screening.screen.venue,
      };

      const qrJwt = signQRCredential(qrPayload);
      const qrDataUrl = await QRCode.toDataURL(qrJwt, {
        errorCorrectionLevel: 'H',
        width: 250,
        margin: 2,
      });

      return {
        ticketId: t.ticketId,
        status: t.status,
        bookedAt: t.bookedAt,
        scannedAt: t.scannedAt,
        seatCode: t.seat.seatCode,
        seatType: t.seat.seatType,
        movieTitle: t.screening.movie.title,
        moviePoster: t.screening.movie.posterUrl,
        genre: t.screening.movie.genre,
        durationMinutes: t.screening.movie.durationMinutes,
        screenName: t.screening.screen.screenName,
        venue: t.screening.screen.venue,
        date: t.screening.date,
        startTime: t.screening.startTime,
        endTime: t.screening.endTime,
        price: t.screening.price,
        qrCode: qrDataUrl,
        qrToken: qrJwt,
      };
    })
  );
}

// ─── Service: Cancel a ticket ──────────────────────────────────────────────────

export async function cancelTicket(userId: number, ticketId: number) {
  const ticket = await prisma.ticket.findFirst({
    where: { ticketId, userId },
  });

  if (!ticket) throw new Error('TICKET_NOT_FOUND');
  if (ticket.status === 'SCANNED') throw new Error('TICKET_ALREADY_SCANNED');
  if (ticket.status === 'CANCELLED') throw new Error('TICKET_ALREADY_CANCELLED');

  return prisma.ticket.update({
    where: { ticketId },
    data: { status: 'CANCELLED' },
    select: { ticketId: true, status: true },
  });
}

// ─── Service: Verify QR (Guard endpoint) ──────────────────────────────────────

export async function verifyAndScanTicket(guardId: number, qrToken: string) {
  const { verifyQRCredential } = await import('../../utils/jwt');

  let payload;
  try {
    payload = verifyQRCredential(qrToken);
  } catch {
    throw new Error('INVALID_QR_TOKEN');
  }

  const ticket = await prisma.ticket.findUnique({
    where: { ticketId: payload.ticket_id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      seat: true,
      screening: {
        include: {
          movie: { select: { title: true } },
          screen: { select: { screenName: true } },
        },
      },
    },
  });

  if (!ticket) throw new Error('TICKET_NOT_FOUND');

  // Validate all fields match what's in the QR
  if (
    ticket.screeningId !== payload.screening_id ||
    ticket.seatId !== payload.seat_id ||
    ticket.userId !== payload.user_id
  ) {
    throw new Error('QR_MISMATCH');
  }

  if (ticket.status === 'CANCELLED') throw new Error('TICKET_CANCELLED');
  if (ticket.status === 'SCANNED') {
    return {
      alreadyScanned: true,
      scannedAt: ticket.scannedAt,
      ticket: summarizeTicket(ticket),
    };
  }

  // Mark as scanned
  await prisma.ticket.update({
    where: { ticketId: ticket.ticketId },
    data: {
      status: 'SCANNED',
      scannedAt: new Date(),
      scannedBy: guardId,
    },
  });

  return {
    alreadyScanned: false,
    ticket: summarizeTicket(ticket),
  };
}

function summarizeTicket(ticket: {
  ticketId: number;
  user: { firstName: string; lastName: string; email: string };
  seat: { seatCode: string };
  screening: {
    movie: { title: string };
    screen: { screenName: string };
    date: Date;
    startTime: Date;
  };
}) {
  return {
    ticketId: ticket.ticketId,
    studentName: `${ticket.user.firstName} ${ticket.user.lastName}`,
    studentEmail: ticket.user.email,
    seatCode: ticket.seat.seatCode,
    movieTitle: ticket.screening.movie.title,
    screenName: ticket.screening.screen.screenName,
    date: ticket.screening.date,
    startTime: ticket.screening.startTime,
  };
}
