import { Class } from '@pikslots/domain';

const now = new Date();

export let CLASS_TEST_DATA: Class[] = [
  // ── business-1 classes ───────────────────────────────────────────────────
  Class.create({
    id: 'class-yoga-1',
    title: 'Morning Yoga Flow',
    description: 'A gentle full-body yoga session to start the day.',
    imagesUrls: [
      'https://cdn.example.com/classes/yoga-1.jpg',
      'https://cdn.example.com/classes/yoga-2.jpg',
    ],
    durationInMins: 60,
    seats: 15,
    cost: 20,
    isHiddenFromBookingPage: false,
    businessId: 'business-1',
    createdBy: 'user-business-owner-1',
  }),
  Class.create({
    id: 'class-pilates-1',
    title: 'Reformer Pilates',
    description: 'Low-impact strength training on reformer machines.',
    imagesUrls: [
      'https://cdn.example.com/classes/pilates-1.jpg',
      'https://cdn.example.com/classes/pilates-2.jpg',
      'https://cdn.example.com/classes/pilates-3.jpg',
      'https://cdn.example.com/classes/pilates-4.jpg',
      'https://cdn.example.com/classes/pilates-5.jpg',
    ],
    durationInMins: 45,
    seats: 8,
    cost: 35,
    // hidden from the public booking page (e.g. invite-only / trial class)
    isHiddenFromBookingPage: true,
    businessId: 'business-1',
    createdBy: 'user-admin-1',
  }),
  // Minimal class — no images, to exercise empty-array handling.
  Class.create({
    id: 'class-hiit-1',
    title: 'HIIT Bootcamp',
    description: 'High-intensity interval training for all levels.',
    imagesUrls: [],
    durationInMins: 30,
    seats: 20,
    cost: 15,
    isHiddenFromBookingPage: false,
    businessId: 'business-1',
    createdBy: 'user-business-owner-1',
  }),

  // ── business-2 class — for cross-business authorization denial ─────────
  Class.create({
    id: 'class-business-2-1',
    title: 'Spin Class',
    description: 'High-energy indoor cycling session.',
    imagesUrls: ['https://cdn.example.com/classes/spin-1.jpg'],
    durationInMins: 50,
    seats: 25,
    cost: 18,
    isHiddenFromBookingPage: false,
    businessId: 'business-2',
    createdBy: 'user-business-owner-2',
  }),

  // ── Soft deleted class — reconstitute() needed because create() always
  //    sets isDeleted: false ───────────────────────────────────────────────
  Class.reconstitute({
    id: 'class-deleted-1',
    title: 'Discontinued Zumba',
    description: 'This class was retired from the schedule.',
    images: ['https://cdn.example.com/classes/zumba-1.jpg'],
    durationInMins: 45,
    seats: 20,
    cost: 12,
    isHiddenFromBookingPage: true,
    businessId: 'business-1',
    createdAt: now,
    createdBy: 'user-business-owner-1',
    updatedAt: now,
    updatedBy: 'user-admin-1',
    deletedAt: now,
    deletedBy: 'user-admin-1',
    isDeleted: true,
  }),
];
