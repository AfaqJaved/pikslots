import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
// mock uuid to avoid ESM parsing issues from node_modules during Jest run
jest.mock('uuid', () => ({ v7: jest.fn().mockReturnValue('fixed-uuid') }));
import { SecurityContext } from 'src/shared/security/context/security.context';
import { PikslotEmailService } from 'src/shared/email/pikslot.email.service';
import { JwtInviteService } from 'src/shared/security/jwt/jwt.invite.service';
import { InviteUserUsecaseImpl } from './invite.user.usecase.impl';

describe('InviteUserUsecaseImpl', () => {
  let useCase: InviteUserUsecaseImpl;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        InviteUserUsecaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
        {
          provide: SecurityContext,
          useValue: { role: 'Platform Owner', userId: 'user-platform-owner-1' },
        },
        {
          provide: PikslotEmailService,
          useValue: { sendEmail: jest.fn().mockResolvedValue({ ok: true }) },
        },
        {
          provide: JwtInviteService,
          useValue: { signInviteToken: jest.fn().mockReturnValue('tok') },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('http://frontend'),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get(InviteUserUsecaseImpl);
  });

  it('invites user successfully and sends email when required', async () => {
    const result = await useCase.execute({
      username: 'new_user_1',
      name: { firstName: 'X', lastName: 'Y' },
      email: 'new1@acme.com',
      phone: '+199999',
      role: 'Enhanced',
      businessId: 'business-1',
      businessName: 'Acme',
    });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.message).toBe('success');
  });

  it('returns inviter_not_authorized when inviter cannot invite role', async () => {
    // create module with Standard role
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        InviteUserUsecaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
        {
          provide: SecurityContext,
          useValue: { role: 'Standard', userId: 'user-standard-1' },
        },
        { provide: PikslotEmailService, useValue: { sendEmail: jest.fn() } },
        { provide: JwtInviteService, useValue: { signInviteToken: jest.fn() } },
        { provide: ConfigService, useValue: { getOrThrow: jest.fn() } },
      ],
    }).compile();

    const localUseCase = moduleRef.get(InviteUserUsecaseImpl);

    const result = await localUseCase.execute({
      username: 'another',
      name: { firstName: 'A', lastName: 'B' },
      email: 'another@acme.com',
      phone: '+100',
      role: 'Admin',
      businessId: 'business-1',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('inviter_not_authorized');
      expect(result.error.message).toBeDefined();
      expect((result.error as any).inviterRole).toBe('Standard');
      expect((result.error as any).attemptedRole).toBe('Admin');
    }
  });

  it('returns user_already_exists when email exists', async () => {
    const result = await useCase.execute({
      username: 'unique_username_1',
      name: { firstName: 'A', lastName: 'B' },
      email: 'alice@pikslots.com', // existing
      phone: '+100',
      role: 'Standard',
      businessId: 'business-1',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('user_already_exists');
      expect(result.error.message).toBeDefined();
      expect((result.error as any).field).toBeDefined();
    }
  });

  it('returns user_already_exists when username exists', async () => {
    const result = await useCase.execute({
      username: 'platform_owner', // existing
      name: { firstName: 'A', lastName: 'B' },
      email: 'unique@acme.com',
      phone: '+100',
      role: 'Standard',
      businessId: 'business-1',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('user_already_exists');
      expect(result.error.message).toBeDefined();
      expect((result.error as any).field).toBeDefined();
    }
  });
});
