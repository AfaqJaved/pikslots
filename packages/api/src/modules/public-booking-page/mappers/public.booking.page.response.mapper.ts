import type { PublicBookingPage, Services } from '@pikslots/domain';
import type { PikslotS3Service } from 'src/shared/s3/s3.service';

export class PublicBookingPageResponseMapper {
  static async toBookingPageResponse(
    s3Service: PikslotS3Service,
    publicBookingPageData: PublicBookingPage,
  ): Promise<PublicBookingPage> {
    const b = publicBookingPageData.business;
    const s = publicBookingPageData.services;
    const t = publicBookingPageData.teamMembers;

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

    const brandApperanceDetails = {
      ...b.brandApperanceDetails,
      gallaryPhotosUrls: await Promise.all(
        b.brandApperanceDetails.gallaryPhotosUrls.map((key) =>
          s3Service.getPresignedDownloadUrl(key),
        ),
      ),
    };

    const signServiceAvatar = async (service: Services): Promise<Services> => {
      if (service.serviceAvatar == '') {
        return { ...service, serviceAvatar: service.serviceAvatar };
      }

      const url = await s3Service.getPresignedDownloadUrl(
        service.serviceAvatar,
      );
      return {
        ...service,
        serviceAvatar: url,
      };
    };

    const servicesWithSignedAvatars = await Promise.all(
      s.services.map(signServiceAvatar),
    );

    const groupsWithSignedAvatars = await Promise.all(
      s.groups.map(async (group) => ({
        ...group,
        services: await Promise.all(group.services.map(signServiceAvatar)),
      })),
    );

    const teamMembersWithSignedAvatars = await Promise.all(
      t.map(async (member) => ({
        ...member,
        avatarUrl:
          member.avatarUrl !== null && member.avatarUrl !== ''
            ? await s3Service.getPresignedDownloadUrl(member.avatarUrl)
            : member.avatarUrl,
      })),
    );

    return {
      business: {
        ...b,
        brandDetail,
        brandApperanceDetails,
      },
      services: {
        groups: groupsWithSignedAvatars,
        services: servicesWithSignedAvatars,
      },
      teamMembers: teamMembersWithSignedAvatars,
    };
  }
}
