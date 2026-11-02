import { prisma } from '../../config/prisma';

/**
 * Aggregates real, live data for the Admin Dashboard in a single call so the
 * numbers are consistent and come straight from the database.
 */
export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  const [
    totalMovies,
    moviesThisMonth,
    allScreenings,
    totalBookings,
    scannedTickets,
    todaysTickets,
    recentTickets,
    screens,
    movies,
  ] = await Promise.all([
    prisma.movie.count(),
    prisma.movie.count({ where: { createdAt: { gte: startOfMonth } } }),
    // Screenings with their movie, screen (incl. seat count) and ticket count.
    prisma.screening.findMany({
      include: {
        movie: { select: { title: true } },
        screen: { select: { screenId: true, screenName: true, _count: { select: { seats: true } } } },
        _count: { select: { tickets: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.ticket.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.ticket.count({ where: { status: 'SCANNED' } }),
    // Tickets booked for screenings happening today.
    prisma.ticket.findMany({
      where: {
        status: { not: 'CANCELLED' },
        screening: { date: { gte: startOfToday, lt: endOfToday } },
      },
      select: { status: true },
    }),
    // Most recent bookings for the recent-bookings table.
    prisma.ticket.findMany({
      orderBy: { bookedAt: 'desc' },
      take: 6,
      include: {
        user: { select: { firstName: true, lastName: true } },
        seat: { select: { seatCode: true } },
        screening: {
          include: {
            movie: { select: { title: true } },
            screen: { select: { screenName: true } },
          },
        },
      },
    }),
    // Screens with their seat counts and non-cancelled ticket counts.
    prisma.screen.findMany({
      include: {
        _count: { select: { seats: true } },
      },
      orderBy: { screenId: 'asc' },
    }),
    prisma.movie.findMany({
      select: { movieId: true, title: true, isActive: true, _count: { select: { screenings: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // ── Derive screening status (active & upcoming vs expired) ──
  const combine = (date: Date, time: Date) =>
    new Date(Date.UTC(
      date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds()
    ));

  const upcomingScreenings = allScreenings.filter((s) => {
    const end = combine(s.date, s.endTime);
    return s.isActive && end.getTime() >= now.getTime();
  });

  const upcomingTable = upcomingScreenings.slice(0, 5).map((s) => {
    const capacity = s.screen._count.seats;
    const booked = s._count.tickets;
    return {
      screeningId: s.screeningId,
      movieTitle: s.movie.title,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      screenName: s.screen.screenName,
      bookings: booked,
      capacity,
      available: Math.max(0, capacity - booked),
      isActive: s.isActive,
    };
  });

  // ── Today's entry activity ──
  const ticketsBookedToday = todaysTickets.length;
  const ticketsScannedToday = todaysTickets.filter((t) => t.status === 'SCANNED').length;
  const remainingExpected = Math.max(0, ticketsBookedToday - ticketsScannedToday);
  const entryRateToday = ticketsBookedToday > 0
    ? Math.round((ticketsScannedToday / ticketsBookedToday) * 100)
    : 0;

  // ── Seat availability per screen (non-cancelled tickets across its screenings) ──
  const seatAvailability = await Promise.all(
    screens.map(async (screen) => {
      const booked = await prisma.ticket.count({
        where: {
          status: { not: 'CANCELLED' },
          seat: { screenId: screen.screenId },
        },
      });
      const capacity = screen._count.seats;
      return {
        screenId: screen.screenId,
        screenName: screen.screenName,
        capacity,
        booked,
        available: Math.max(0, capacity - booked),
      };
    })
  );

  // ── Publishing status (active vs inactive movies) ──
  const publishing = {
    published: movies.filter((m) => m.isActive).length,
    unpublished: movies.filter((m) => !m.isActive).length,
    list: movies.map((m) => ({
      movieId: m.movieId,
      title: m.title,
      isActive: m.isActive,
      screenings: m._count.screenings,
    })),
  };

  // ── Recent bookings ──
  const recentBookings = recentTickets.map((t) => ({
    ticketId: t.ticketId,
    studentName: `${t.user.firstName} ${t.user.lastName}`,
    movieTitle: t.screening.movie.title,
    screenName: t.screening.screen.screenName,
    date: t.screening.date,
    seatCode: t.seat.seatCode,
    status: t.status,
    bookedAt: t.bookedAt,
  }));

  return {
    stats: {
      totalMovies,
      moviesThisMonth,
      upcomingScreenings: upcomingScreenings.length,
      totalBookings,
      scannedTickets,
      overallEntryRate: totalBookings > 0 ? Math.round((scannedTickets / totalBookings) * 100) : 0,
    },
    todaysActivity: {
      ticketsBooked: ticketsBookedToday,
      ticketsScanned: ticketsScannedToday,
      remainingExpected,
      entryRate: entryRateToday,
    },
    upcomingScreenings: upcomingTable,
    seatAvailability,
    publishing,
    recentBookings,
  };
}
