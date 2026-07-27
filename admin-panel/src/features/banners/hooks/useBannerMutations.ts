import { useCrudMutations } from '../../../core/hooks/useCrudMutations';
import { bannerService } from '../services/bannerService';
import type { BannerDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export function useBannerMutations(onSuccessCallback?: () => void) {
  const { success, error: showError } = useToast();
  const mutations = useCrudMutations<BannerDTO>(bannerService);

  const handleCreate = async (data: Omit<BannerDTO, 'id'>) => {
    const result = await mutations.create(data as BannerDTO);
    if (result) {
      success('Banner created successfully');
      if (onSuccessCallback) onSuccessCallback();
    } else if (mutations.error) {
      showError(mutations.error.message);
    }
    return result;
  };

  const handleUpdate = async (id: string, data: Partial<BannerDTO>) => {
    await mutations.update(id, data);
    if (!mutations.error) {
      success('Banner updated successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } else {
      showError(mutations.error.message);
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    await mutations.delete(id);
    if (!mutations.error) {
      success('Banner deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } else {
      showError(mutations.error.message);
      return false;
    }
  };

  const handleArchive = async (id: string, archive: boolean) => {
    await handleUpdate(id, { status: archive ? 'archived' : 'draft' });
  };

  return {
    createBanner: handleCreate,
    updateBanner: handleUpdate,
    deleteBanner: handleDelete,
    archiveBanner: handleArchive,
    loading: mutations.loading,
    error: mutations.error,
  };
}
