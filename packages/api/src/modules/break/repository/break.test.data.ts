import { Break } from '@pikslots/domain';

const now = new Date();

export let BREAK_TEST_DATA: Break[] = [
  // ── Platform Owner breaks ─────────────────────────────────────────────────
  Break.create({
    id: 'break-platform-owner-1',
    userId: 'user-platform-owner-1',
    businessId: 'business-1',
    day: 'monday',
    startTime: '10:00',
    endTime: '11:00',
    createdBy: 'user-platform-owner-1',
  }),

  Break.create({
    id: 'break-platform-owner-2',
    userId: 'user-platform-owner-1',
    businessId: 'business-1',
    day: 'monday',
    startTime: '14:00',
    endTime: '14:30',
    createdBy: 'user-platform-owner-1',
  }),

  // ── Business Owner breaks ─────────────────────────────────────────────────
  Break.create({
    id: 'break-business-owner-1',
    userId: 'user-business-owner-1',
    businessId: 'business-1',
    day: 'tuesday',
    startTime: '09:00',
    endTime: '09:30',
    createdBy: 'user-business-owner-1',
  }),

  Break.create({
    id: 'break-business-owner-2',
    userId: 'user-business-owner-1',
    businessId: 'business-1',
    day: 'wednesday',
    startTime: '13:00',
    endTime: '14:00',
    createdBy: 'user-business-owner-1',
  }),

  // ── Admin breaks ──────────────────────────────────────────────────────────
  Break.create({
    id: 'break-admin-1',
    userId: 'user-admin-1',
    businessId: 'business-1',
    day: 'monday',
    startTime: '12:00',
    endTime: '13:00',
    createdBy: 'user-admin-1',
  }),

  Break.create({
    id: 'break-admin-2',
    userId: 'user-admin-1',
    businessId: 'business-1',
    day: 'friday',
    startTime: '15:00',
    endTime: '15:30',
    createdBy: 'user-admin-1',
  }),

  // ── Enhanced breaks ───────────────────────────────────────────────────────
  Break.create({
    id: 'break-enhanced-1',
    userId: 'user-enhanced-1',
    businessId: 'business-1',
    day: 'thursday',
    startTime: '11:00',
    endTime: '11:30',
    createdBy: 'user-enhanced-1',
  }),

  // ── Standard breaks ───────────────────────────────────────────────────────
  Break.create({
    id: 'break-standard-1',
    userId: 'user-standard-1',
    businessId: 'business-1',
    day: 'monday',
    startTime: '13:00',
    endTime: '13:30',
    createdBy: 'user-standard-1',
  }),

  Break.create({
    id: 'break-standard-2',
    userId: 'user-standard-1',
    businessId: 'business-1',
    day: 'wednesday',
    startTime: '10:00',
    endTime: '10:30',
    createdBy: 'user-standard-1',
  }),

  // ── Soft deleted break — reconstitute() needed because
  //    create() always sets isDeleted: false ─────────────────────────────────
  Break.reconstitute({
    id: 'break-deleted-1',
    userId: 'user-standard-1',
    businessId: 'business-1',
    day: 'friday',
    startTime: '09:00',
    endTime: '09:30',
    createdAt: now,
    createdBy: 'user-standard-1',
    updatedAt: now,
    updatedBy: 'user-admin-1',
    deletedAt: now,
    deletedBy: 'user-admin-1',
    isDeleted: true,
  }),
];
