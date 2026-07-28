import { Service } from '@pikslots/domain';
import { ServiceResponse } from '@pikslots/shared';
import { PikslotS3Service } from 'src/shared/s3/s3.service';

export class ResponseMapper {
  static async toServiceResponse(
    s3Service: PikslotS3Service,
    service: Service,
  ): Promise<ServiceResponse> {
    const avatar = {
      serviceAvatar:
        service.serviceAvatar !== ''
          ? await s3Service.getPresignedDownloadUrl(service.serviceAvatar)
          : service.serviceAvatar,
    };
    return {
      id: service.id,
      title: service.title,
      description: service.description,
      serviceAvatar: avatar.serviceAvatar,
      durationInMins: service.durationInMins,
      bufferTimeInMins: service.bufferTimeInMins,
      cost: service.cost,
      isHiddenFromBookingPage: service.isHiddenFromBookingPage,
      businessId: service.businessId,
      colorCode: service.colorCode,
    };
  }
}
