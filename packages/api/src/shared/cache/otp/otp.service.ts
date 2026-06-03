import { Inject, Injectable } from '@nestjs/common';
import type { Cacheable } from 'cacheable';
import { CACHE } from '../cache.tokens';

const OTP_TTL = '5m';

@Injectable()
export class OtpService {
  constructor(@Inject(CACHE) private readonly cache: Cacheable) {}

  async generate(key: string): Promise<string> {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await this.cache.set(key, otp, OTP_TTL);
    return otp;
  }

  async verify(key: string, otp: string): Promise<boolean> {
    const stored = await this.cache.get<string>(key);
    if (!stored || stored !== otp) return false;
    await this.cache.delete(key);
    return true;
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }
}
