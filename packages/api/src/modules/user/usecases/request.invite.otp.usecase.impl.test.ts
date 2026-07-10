import { Test, TestingModule } from '@nestjs/testing';
import { IUserRepository } from '@pikslots/domain';
import { UserRepositoryTestImpl } from '../repository/user.repository.fake.impl';
import { RequestInviteOtpUseCaseImpl } from './request.invite.otp.usecase.impl';
import { OtpService } from 'src/shared/cache/otp/otp.service';
import { PikslotEmailService } from 'src/shared/email/pikslot.email.service';
import { JwtInviteService } from 'src/shared/security/jwt/jwt.invite.service';

describe('RequestInviteOtpUseCaseImpl', () => {
  let useCase: RequestInviteOtpUseCaseImpl;
  let otpService: jest.Mocked<OtpService>;
  let jwtService: jest.Mocked<JwtInviteService>;
  let emailService: jest.Mocked<PikslotEmailService>;
  let repo: any;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RequestInviteOtpUseCaseImpl,
        { provide: IUserRepository, useClass: UserRepositoryTestImpl },
        { provide: OtpService, useValue: { generate: jest.fn() } },
        { provide: PikslotEmailService, useValue: { sendEmail: jest.fn() } },
        {
          provide: JwtInviteService,
          useValue: { verifyInviteToken: jest.fn() },
        },
      ],
    }).compile();

    useCase = moduleRef.get(RequestInviteOtpUseCaseImpl);
    otpService = moduleRef.get(OtpService);
    jwtService = moduleRef.get(JwtInviteService);
    emailService = moduleRef.get(PikslotEmailService);
    repo = moduleRef.get(IUserRepository);
  });

  it('returns success when token valid and user invited', async () => {
    jwtService.verifyInviteToken.mockReturnValue({
      ok: true,
      value: { userId: 'user-standard-1', businessId: 'business-1' },
    } as any);
    otpService.generate.mockResolvedValue('123456');
    (emailService.sendEmail as jest.Mock).mockResolvedValue({ ok: true });
    const result = await useCase.execute({ token: 'tok' } as any);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.message).toBe('success');
  });

  it('returns unauthorized when token invalid', async () => {
    jwtService.verifyInviteToken.mockReturnValue({
      ok: false,
      error: { kind: 'unauthorized' },
    } as any);

    const result = await useCase.execute({ token: 'bad' } as any);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('unauthorized');
      expect(result.error.message).toBeDefined();
    }
  });

  it('returns user_not_found when user missing', async () => {
    jwtService.verifyInviteToken.mockReturnValue({
      ok: true,
      value: { userId: 'non-existent', businessId: 'business-1' },
    } as any);

    const result = await useCase.execute({ token: 'tok' } as any);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('user_not_found');
      expect(result.error.message).toBeDefined();
      expect((result.error as any).by).toBe('id');
      expect((result.error as any).value).toBe('non-existent');
    }
  });

  it('returns invite_already_accepted when user already accepted', async () => {
    jwtService.verifyInviteToken.mockReturnValue({
      ok: true,
      value: { userId: 'user-standard-1', businessId: 'business-1' },
    } as any);
    // activate user
    const find = await repo.findById('user-standard-1');
    const user = find.value;
    const accepted = user.acceptInvite('pw', 'test');
    await repo.update(accepted);

    const result = await useCase.execute({ token: 'tok' } as any);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('invite_already_accepted');
      expect(result.error.message).toBeDefined();
    }
  });
});
