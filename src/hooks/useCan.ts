import { validateUserAccess } from '../utils/validadeUserAccess';

import { useAuth } from './useAuth';

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ permissions = [], roles = [] }: UseCanParams) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return false;
  }

  const userHasValidPermissions = validateUserAccess({
    user,
    permissions,
    roles,
  });

  return userHasValidPermissions;
}
