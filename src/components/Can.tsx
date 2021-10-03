import React from 'react';

import { useCan } from '../hooks/useCan';

type CanProps = {
  permissions?: string[];
  roles?: string[];
};

export const Can: React.FC<CanProps> = ({
  roles = [],
  permissions = [],
  children,
}) => {
  const userCanSeeComponent = useCan({
    roles,
    permissions,
  });

  if (userCanSeeComponent) {
    return <>{children}</>;
  }

  return null;
};
