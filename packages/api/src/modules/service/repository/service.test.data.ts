import { Service } from '@pikslots/domain';

const now = new Date();

export const SERVICE_TEST_DATA: Service[] = [
  // ── business-1 services ──────────────────────────────────────────────────
  Service.create({
    id: 'service-haircut-1',
    title: 'Haircut & Style',
    description: 'A full haircut and styling session.',
    serviceAvatar: 'https://cdn.example.com/services/haircut-1.jpg',
    durationInMins: 45,
    bufferTimeInMins: 15,
    cost: 40,
    isHiddenFromBookingPage: false,
    businessId: 'business-1',
    colorCode: '#F4A261',
    createdBy: 'user-business-owner-1',
  }),
  Service.create({
    id: 'service-massage-1',
    title: 'Deep Tissue Massage',
    description: 'A 60-minute deep tissue massage session.',
    serviceAvatar: 'https://cdn.example.com/services/haircut-1.jpg',
    durationInMins: 60,
    bufferTimeInMins: 20,
    cost: 90,
    // hidden from the public booking page (e.g. staff-only / trial service)
    isHiddenFromBookingPage: true,
    businessId: 'business-1',
    colorCode: '#2A9D8F',
    createdBy: 'user-admin-1',
  }),
  // Minimal service — no images, to exercise empty-array handling.
  Service.create({
    id: 'service-consultation-1',
    title: 'Initial Consultation',
    serviceAvatar: 'https://cdn.example.com/services/haircut-1.jpg',
    description: 'A free 15-minute consultation for new clients.',
    durationInMins: 15,
    bufferTimeInMins: 5,
    cost: 0,
    isHiddenFromBookingPage: false,
    businessId: 'business-1',
    colorCode: '#264653',
    createdBy: 'user-business-owner-1',
  }),

  // ── business-2 service — for cross-business authorization denial ───────
  Service.create({
    id: 'service-business-2-1',
    title: 'Manicure',
    description: 'A classic manicure treatment.',
    serviceAvatar: 'https://cdn.example.com/services/haircut-1.jpg',
    durationInMins: 30,
    bufferTimeInMins: 10,
    cost: 25,
    isHiddenFromBookingPage: false,
    businessId: 'business-2',
    colorCode: '#E76F51',
    createdBy: 'user-business-owner-2',
  }),

  // ── Soft deleted service — reconstitute() needed because create() always
  //    sets isDeleted: false ───────────────────────────────────────────────
  Service.reconstitute({
    id: 'service-deleted-1',
    title: 'Discontinued Facial',
    description: 'This service was retired from the menu.',
    serviceAvatar: 'https://cdn.example.com/services/haircut-1.jpg',
    durationInMins: 50,
    bufferTimeInMins: 15,
    cost: 60,
    isHiddenFromBookingPage: true,
    businessId: 'business-1',
    colorCode: '#E9C46A',
    createdAt: now,
    createdBy: 'user-business-owner-1',
    updatedAt: now,
    updatedBy: 'user-admin-1',
    deletedAt: now,
    deletedBy: 'user-admin-1',
    isDeleted: true,
  }),
];
