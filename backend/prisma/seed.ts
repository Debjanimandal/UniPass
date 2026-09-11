import { PrismaClient, Role, SeatType, TicketStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding UniPass database...\n');

  // ─── Clean up existing data ────────────────────────────────────────────────
  await prisma.ticket.deleteMany();
  await prisma.screening.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ─────────────────────────────────────────────────────────────────
  console.log('👤 Creating users...');

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'UniPass',
      email: 'admin@unipass.edu',
      phone: '+44 7700 000001',
      passwordHash: await hash('Admin@1234'),
      role: Role.ADMIN,
    },
  });

  const guard1 = await prisma.user.create({
    data: {
      firstName: 'James',
      lastName: 'Porter',
      email: 'guard@unipass.edu',
      phone: '+44 7700 000002',
      passwordHash: await hash('Guard@1234'),
      role: Role.GUARD,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      firstName: 'Aisha',
      lastName: 'Rahman',
      email: 'aisha@student.unipass.edu',
      phone: '+44 7700 100001',
      passwordHash: await hash('Student@1234'),
      role: Role.STUDENT,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      firstName: 'Liam',
      lastName: 'Carter',
      email: 'liam@student.unipass.edu',
      phone: '+44 7700 100002',
      passwordHash: await hash('Student@1234'),
      role: Role.STUDENT,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      firstName: 'Sophie',
      lastName: 'Williams',
      email: 'sophie@student.unipass.edu',
      phone: '+44 7700 100003',
      passwordHash: await hash('Student@1234'),
      role: Role.STUDENT,
    },
  });

  console.log('  ✅ 5 users created (1 admin, 1 guard, 3 students)');

  // ─── Movies ────────────────────────────────────────────────────────────────
  console.log('\n🎬 Creating movies...');

  const movies = await Promise.all([
    prisma.movie.create({
      data: {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival. Breathtaking visuals and an emotional story about love, time, and sacrifice.',
        durationMinutes: 169,
        language: 'English',
        genre: 'Sci-Fi',
        posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIe.jpg',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'The Grand Budapest Hotel',
        description: 'The adventures of Gustave H, a legendary concierge at a famous European hotel, and Zero Moustafa, the lobby boy who becomes his trusted friend.',
        durationMinutes: 99,
        language: 'English',
        genre: 'Comedy',
        posterUrl: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JiT2d6WCpLJMiGn5.jpg',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Parasite',
        description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan. Winner of the Palme d\'Or.',
        durationMinutes: 132,
        language: 'Korean',
        genre: 'Thriller',
        posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. An epic continuation of the sci-fi saga.',
        durationMinutes: 166,
        language: 'English',
        genre: 'Sci-Fi',
        posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      },
    }),
    prisma.movie.create({
      data: {
        title: 'Past Lives',
        description: 'Two childhood friends separated by circumstances reconnect over two decades later, confronting what could have been and the lives they have chosen.',
        durationMinutes: 106,
        language: 'English',
        genre: 'Drama',
        posterUrl: 'https://image.tmdb.org/t/p/w500/k3waqVXPBIH4H3zVMDOAcbMbvGn.jpg',
      },
    }),
  ]);

  console.log(`  ✅ ${movies.length} movies created`);

  // ─── Screens ───────────────────────────────────────────────────────────────
  console.log('\n🏛️ Creating screens...');

  const screenA = await prisma.screen.create({
    data: {
      screenName: 'Screen A',
      venue: 'Main Hall, Student Union',
      description: 'The main screening hall with 60 seats, premium projection and Dolby sound.',
    },
  });

  const screenB = await prisma.screen.create({
    data: {
      screenName: 'Screen B',
      venue: 'Lecture Theatre 3, Arts Building',
      description: 'Intimate 30-seat screening room perfect for arthouse and foreign language films.',
    },
  });

  const screenC = await prisma.screen.create({
    data: {
      screenName: 'Screen C',
      venue: 'Media Lab, Engineering Block',
      description: 'Modern 40-seat digital screening room with 4K projection and surround sound.',
    },
  });

  console.log('  ✅ 3 screens created');

  // ─── Seats: Screen A (6 rows × 10 seats) ──────────────────────────────────
  console.log('\n💺 Creating seat layouts...');

  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const screenASeats: typeof prisma.seat.create extends (args: infer A) => unknown ? Awaited<ReturnType<typeof prisma.seat.create>>[] : never[] = [];

  for (let rowIdx = 0; rowIdx < rowLabels.length; rowIdx++) {
    const rowLabel = rowLabels[rowIdx];
    const seatsPerRow = 10;
    // Rows A-B = REGULAR, C-D = PREMIUM, E-F = VIP
    const seatType =
      rowIdx < 2 ? SeatType.REGULAR :
      rowIdx < 4 ? SeatType.PREMIUM :
      SeatType.VIP;

    for (let seatNo = 1; seatNo <= seatsPerRow; seatNo++) {
      const seat = await prisma.seat.create({
        data: {
          screenId: screenA.screenId,
          rowNo: rowIdx + 1,
          seatNo,
          seatCode: `${rowLabel}${seatNo}`,
          seatType,
        },
      });
      screenASeats.push(seat);
    }
  }

  // Screen B (5 rows × 6 seats = 30 seats)
  const screenBSeats: typeof screenASeats = [];
  for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
    const rowLabel = rowLabels[rowIdx];
    for (let seatNo = 1; seatNo <= 6; seatNo++) {
      const seatType = rowIdx < 3 ? SeatType.REGULAR : SeatType.PREMIUM;
      const seat = await prisma.seat.create({
        data: {
          screenId: screenB.screenId,
          rowNo: rowIdx + 1,
          seatNo,
          seatCode: `${rowLabel}${seatNo}`,
          seatType,
        },
      });
      screenBSeats.push(seat);
    }
  }

  // Screen C (5 rows × 8 seats = 40 seats)
  const screenCSeats: typeof screenASeats = [];
  for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
    const rowLabel = rowLabels[rowIdx];
    for (let seatNo = 1; seatNo <= 8; seatNo++) {
      const seatType =
        rowIdx < 2 ? SeatType.REGULAR :
        rowIdx < 4 ? SeatType.PREMIUM :
        SeatType.VIP;
      const seat = await prisma.seat.create({
        data: {
          screenId: screenC.screenId,
          rowNo: rowIdx + 1,
          seatNo,
          seatCode: `${rowLabel}${seatNo}`,
          seatType,
        },
      });
      screenCSeats.push(seat);
    }
  }

  console.log(`  ✅ ${screenASeats.length + screenBSeats.length + screenCSeats.length} seats created across 3 screens`);

  // ─── Screenings ────────────────────────────────────────────────────────────
  console.log('\n📅 Creating screenings...');

  // Helper: create Date objects for future screenings
  const futureDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const time = (hours: number, minutes = 0) => {
    const d = new Date(0);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const screenings = await Promise.all([
    // Interstellar — Screen A — tomorrow 19:30
    prisma.screening.create({
      data: {
        movieId: movies[0].movieId,
        screenId: screenA.screenId,
        date: futureDate(1),
        startTime: time(19, 30),
        endTime: time(22, 19),
        price: 4.50,
      },
    }),
    // Interstellar — Screen C — day after tomorrow 15:00
    prisma.screening.create({
      data: {
        movieId: movies[0].movieId,
        screenId: screenC.screenId,
        date: futureDate(2),
        startTime: time(15, 0),
        endTime: time(17, 49),
        price: 3.50,
      },
    }),
    // Grand Budapest Hotel — Screen B — in 3 days 18:00
    prisma.screening.create({
      data: {
        movieId: movies[1].movieId,
        screenId: screenB.screenId,
        date: futureDate(3),
        startTime: time(18, 0),
        endTime: time(19, 39),
        price: 3.00,
      },
    }),
    // Parasite — Screen A — in 4 days 20:00
    prisma.screening.create({
      data: {
        movieId: movies[2].movieId,
        screenId: screenA.screenId,
        date: futureDate(4),
        startTime: time(20, 0),
        endTime: time(22, 12),
        price: 4.00,
      },
    }),
    // Dune: Part Two — Screen C — in 5 days 19:00
    prisma.screening.create({
      data: {
        movieId: movies[3].movieId,
        screenId: screenC.screenId,
        date: futureDate(5),
        startTime: time(19, 0),
        endTime: time(21, 46),
        price: 5.00,
      },
    }),
    // Past Lives — Screen B — in 6 days 17:30
    prisma.screening.create({
      data: {
        movieId: movies[4].movieId,
        screenId: screenB.screenId,
        date: futureDate(6),
        startTime: time(17, 30),
        endTime: time(19, 16),
        price: 3.00,
      },
    }),
  ]);

  console.log(`  ✅ ${screenings.length} screenings created`);

  // ─── Tickets ───────────────────────────────────────────────────────────────
  console.log('\n🎟️ Creating sample tickets...');

  // Aisha booked Interstellar tomorrow (VALID)
  const ticket1 = await prisma.ticket.create({
    data: {
      userId: student1.userId,
      screeningId: screenings[0].screeningId,
      seatId: screenASeats[2].seatId, // A3
      status: TicketStatus.VALID,
    },
  });

  // Liam booked Interstellar tomorrow (VALID)
  await prisma.ticket.create({
    data: {
      userId: student2.userId,
      screeningId: screenings[0].screeningId,
      seatId: screenASeats[5].seatId, // A6
      status: TicketStatus.VALID,
    },
  });

  // Sophie booked Parasite (VALID)
  await prisma.ticket.create({
    data: {
      userId: student3.userId,
      screeningId: screenings[3].screeningId,
      seatId: screenASeats[10].seatId, // B1
      status: TicketStatus.VALID,
    },
  });

  // Aisha booked Grand Budapest Hotel — CANCELLED example
  await prisma.ticket.create({
    data: {
      userId: student1.userId,
      screeningId: screenings[2].screeningId,
      seatId: screenBSeats[0].seatId, // A1
      status: TicketStatus.CANCELLED,
    },
  });

  // Liam — already scanned ticket (Dune)
  await prisma.ticket.create({
    data: {
      userId: student2.userId,
      screeningId: screenings[4].screeningId,
      seatId: screenCSeats[0].seatId, // A1
      status: TicketStatus.SCANNED,
      scannedAt: new Date(),
      scannedBy: guard1.userId,
    },
  });

  console.log('  ✅ 5 sample tickets created');

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────');
  console.log('✅ Database seeded successfully!\n');
  console.log('📧 Test accounts:');
  console.log('  Admin:   admin@unipass.edu     / Admin@1234');
  console.log('  Guard:   guard@unipass.edu     / Guard@1234');
  console.log('  Student: aisha@student.unipass.edu  / Student@1234');
  console.log('  Student: liam@student.unipass.edu   / Student@1234');
  console.log('  Student: sophie@student.unipass.edu / Student@1234');
  console.log('─────────────────────────────────────\n');

  void ticket1;
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
