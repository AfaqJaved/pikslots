import { ApiProperty } from '@nestjs/swagger';
import type { UpdateBusinessLinksInput } from '@pikslots/shared';

export class UpdateBusinessLinksDto implements UpdateBusinessLinksInput {
  @ApiProperty({ example: 'https://example.com', required: false })
  Website: string;

  @ApiProperty({ example: 'https://instagram.com/handle', required: false })
  Instagram: string;

  @ApiProperty({ example: 'https://facebook.com/handle', required: false })
  Facebook: string;

  @ApiProperty({ example: 'https://tiktok.com/@handle', required: false })
  Tiktok: string;

  @ApiProperty({ example: 'https://x.com/handle', required: false })
  X: string;

  @ApiProperty({ example: 'https://youtube.com/@handle', required: false })
  Youtube: string;

  @ApiProperty({ example: 'https://linkedin.com/in/handle', required: false })
  LinkedIn: string;
}
