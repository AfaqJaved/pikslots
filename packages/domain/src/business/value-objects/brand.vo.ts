import type { BrandButtonShape, BrandTheme } from '../types';

export interface BrandDetails {
  bannerImageUrl: string;
  brandLogoUrl: string;
}

export interface BrandApperanceDetails {
  brandColor: string;
  brandButtonShape: BrandButtonShape;
  theme: BrandTheme;
  gallaryPhotosUrls: string[];
}
