import { useMutation } from '@tanstack/react-query';
import uploadApi from '../api/upload.api';

export const useAssetUpload = () => {
  return useMutation({
    mutationFn: async ({
      assetType,
      file,
    }: {
      assetType: 'logo' | 'banner';
      file: File;
    }) => {
      const presigned = await uploadApi.presignedUrl({
        assetType,
        contentType: file.type,
      });
      await uploadApi.uploadFile(presigned.uploadUrl, file);
      return presigned.publicUrl;
    },
  });
};
