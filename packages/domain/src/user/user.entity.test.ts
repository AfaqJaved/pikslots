import { describe, it, expect } from 'vitest';
import { User } from './user.entity';

// ── canUpdateWorkingHours permission matrix ────────────────────────────────────
//
// Signature: canUpdateWorkingHours(updaterRole, isSelf, isPartOfSameBusiness)
//
// ┌────────────────┬─────────┬──────────────────────┬────────┐
// │ Role           │ isSelf  │ isPartOfSameBusiness  │ Result │
// ├────────────────┼─────────┼──────────────────────┼────────┤
// │ Platform Owner │ false   │ false                 │ true   │ ← unrestricted
// │ Platform Owner │ true    │ false                 │ true   │ ← unrestricted
// │ Platform Owner │ false   │ true                  │ true   │ ← unrestricted
// ├────────────────┼─────────┼──────────────────────┼────────┤
// │ Business Owner │ false   │ true                  │ true   │ ← same business
// │ Business Owner │ true    │ true                  │ true   │ ← same business (self)
// │ Business Owner │ false   │ false                 │ false  │ ← different business
// ├────────────────┼─────────┼──────────────────────┼────────┤
// │ Admin          │ false   │ true                  │ true   │ ← same business
// │ Admin          │ true    │ true                  │ true   │ ← same business (self)
// │ Admin          │ false   │ false                 │ false  │ ← different business
// ├────────────────┼─────────┼──────────────────────┼────────┤
// │ Enhanced       │ true    │ false                 │ true   │ ← self only
// │ Enhanced       │ false   │ true                  │ false  │ ← cannot manage others
// │ Enhanced       │ false   │ false                 │ false  │ ← cannot manage others
// ├────────────────┼─────────┼──────────────────────┼────────┤
// │ Standard       │ true    │ false                 │ true   │ ← self only
// │ Standard       │ false   │ true                  │ false  │ ← cannot manage others
// │ Standard       │ false   │ false                 │ false  │ ← cannot manage others
// ├────────────────┼─────────┼──────────────────────┼────────┤
// │ No Access      │ true    │ false                 │ false  │ ← never allowed
// │ No Access      │ false   │ true                  │ false  │ ← never allowed
// │ No Access      │ false   │ false                 │ false  │ ← never allowed
// └────────────────┴─────────┴──────────────────────┴────────┘

describe('User.canUpdateWorkingHours', () => {
  // ── Platform Owner ──────────────────────────────────────────────────────────

  describe('Platform Owner', () => {
    it('can update any user (isSelf=false, different business)', () => {
      expect(User.canUpdateWorkingHours('Platform Owner', false, false)).toBe(true);
    });

    it('can update any user (isSelf=true)', () => {
      expect(User.canUpdateWorkingHours('Platform Owner', true, false)).toBe(true);
    });

    it('can update any user (same business)', () => {
      expect(User.canUpdateWorkingHours('Platform Owner', false, true)).toBe(true);
    });
  });

  // ── Business Owner ──────────────────────────────────────────────────────────

  describe('Business Owner', () => {
    it('can update a user in the same business', () => {
      expect(User.canUpdateWorkingHours('Business Owner', false, true)).toBe(true);
    });

    it('cannot update a user in a different business', () => {
      expect(User.canUpdateWorkingHours('Business Owner', false, false)).toBe(false);
    });

    it('can update self within the same business', () => {
      expect(User.canUpdateWorkingHours('Business Owner', true, true)).toBe(true);
    });
  });

  // ── Admin ───────────────────────────────────────────────────────────────────

  describe('Admin', () => {
    it('can update a user in the same business', () => {
      expect(User.canUpdateWorkingHours('Admin', false, true)).toBe(true);
    });

    it('cannot update a user in a different business', () => {
      expect(User.canUpdateWorkingHours('Admin', false, false)).toBe(false);
    });

    it('can update self within the same business', () => {
      expect(User.canUpdateWorkingHours('Admin', true, true)).toBe(true);
    });
  });

  // ── Enhanced ────────────────────────────────────────────────────────────────

  describe('Enhanced', () => {
    it('can update self', () => {
      expect(User.canUpdateWorkingHours('Enhanced', true, false)).toBe(true);
    });

    it('cannot update another user in the same business', () => {
      expect(User.canUpdateWorkingHours('Enhanced', false, true)).toBe(false);
    });

    it('cannot update another user in a different business', () => {
      expect(User.canUpdateWorkingHours('Enhanced', false, false)).toBe(false);
    });
  });

  // ── Standard ────────────────────────────────────────────────────────────────

  describe('Standard', () => {
    it('can update self', () => {
      expect(User.canUpdateWorkingHours('Standard', true, false)).toBe(true);
    });

    it('cannot update another user in the same business', () => {
      expect(User.canUpdateWorkingHours('Standard', false, true)).toBe(false);
    });

    it('cannot update another user in a different business', () => {
      expect(User.canUpdateWorkingHours('Standard', false, false)).toBe(false);
    });
  });

  // ── No Access ───────────────────────────────────────────────────────────────

  describe('No Access', () => {
    it('cannot update self', () => {
      expect(User.canUpdateWorkingHours('No Access', true, false)).toBe(false);
    });

    it('cannot update another user in the same business', () => {
      expect(User.canUpdateWorkingHours('No Access', false, true)).toBe(false);
    });

    it('cannot update any user', () => {
      expect(User.canUpdateWorkingHours('No Access', false, false)).toBe(false);
    });
  });
});
