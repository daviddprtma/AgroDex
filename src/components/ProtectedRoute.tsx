/**
 * =============================================================================
 * ProtectedRoute — Guards routes behind authentication
 * =============================================================================
 *
 * Allows access if EITHER:
 *  1. User is logged in via Supabase email auth (existing), OR
 *  2. User has connected their HashPack wallet (new)
 *
 * This preserves backward compatibility while adding wallet-based access.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { useCoreWallet } from '@/hooks/useCoreWallet';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isConnected: isHashPackConnected, isInitialized } = useWallet();
  const { isConnected: isCoreConnected } = useCoreWallet();

  const isConnected = isHashPackConnected || isCoreConnected;

  if (!authLoading && user) {
    return <>{children}</>;
  }

  if (authLoading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !isConnected) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
