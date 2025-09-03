import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

type Props = { allow: Role[]; children: React.ReactNode; fallback?: React.ReactNode };

const RoleGuard: React.FC<Props> = ({ allow, children, fallback = null }) => {
  const { user } = useAuth();
  if (!user) return null;
  return allow.includes(user.role) ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;