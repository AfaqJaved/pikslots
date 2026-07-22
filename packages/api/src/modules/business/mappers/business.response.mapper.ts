import type { Business } from '@pikslots/domain';
import type { BusinessResponse } from '@pikslots/shared';
import type { PikslotS3Service } from 'src/shared/s3/s3.service';

export class BusinessResponseMapper {
  static async toBusinessResponse(
    b: Business,
    s3Service: PikslotS3Service,
  ): Promise<BusinessResponse> {
    const brandDetail = {
      bannerImageUrl:
        b.brandDetail.bannerImageUrl !== ''
          ? await s3Service.getPresignedDownloadUrl(
              b.brandDetail.bannerImageUrl,
            )
          : b.brandDetail.bannerImageUrl,
      brandLogoUrl:
        b.brandDetail.brandLogoUrl !== ''
          ? await s3Service.getPresignedDownloadUrl(b.brandDetail.brandLogoUrl)
          : b.brandDetail.brandLogoUrl,
    };

    const brandAppearanceDetails = {
      ...b.brandApperanceDetails,
      gallaryPhotosUrls: await Promise.all(
        b.brandApperanceDetails.gallaryPhotosUrls.map((key) =>
          s3Service.getPresignedDownloadUrl(key),
        ),
      ),
    };

    return {
      id: b.id,
      ownerId: b.ownerId,
      slug: b.slug,
      name: b.name,
      industry: b.industry,
      about: b.about,
      appearInSearchResults: b.appearInSearchResults,
      status: b.status,
      suspendedReason: b.suspendedReason,
      brandDetail,
      brandAppearanceDetails,
      locationDetails: b.locationDetails,
      bookingPolicies: b.bookingPolicies,
      bookingSetup: b.bookingSetup,
      bookingContactFields: b.bookingContactFields,
      bookingCustomization: b.bookingCustomization,
      bookingLabelOverrides: b.bookingLabelOverrides,
      businessHours: b.businessHours,
      businessLinks: b.businessLinks,
      contactDetails: b.contactDetails,
      teamNotifications: b.teamNotifications,
      customerNotifications: b.customerNotifications,
      notificationCustomization: b.notificationCustomization,
      subscriptionPlan: b.subscriptionPlan,
      subscriptionStatus: b.subscriptionStatus,
      trialEndsAt: b.trialEndsAt,
      createdAt: b.createdAt,
      createdBy: b.createdBy,
      updatedAt: b.updatedAt,
      updatedBy: b.updatedBy,
    };
  }
}
