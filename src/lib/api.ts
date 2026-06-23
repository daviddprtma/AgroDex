import { supabase } from "./supabaseClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://agro-dex-nine.vercel.app";

/**
 * Get aggregated fraud overview stats for the Risk Intelligence dashboard.
 * Public endpoint — no authentication required.
 */
export const getFraudOverview = async (): Promise<{ ok: boolean; data: FraudOverview }> => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/fraud/overview`, {
    method: 'GET',
    headers,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any = null;
  try { payload = await response.json(); } catch { /* ignore */ }

  if (!response.ok) {
    throw new Error(payload?.error ?? `getFraudOverview failed: HTTP ${response.status}`);
  }
  return payload;
};

/**
 * Hard-deletes the authenticated user's account via the backend.
 *
 * CRITICAL — call order matters:
 * This MUST run before signOut(). The backend authenticates via the
 * session's access_token. Once signOut() runs the token is gone → 401.
 *
 * Requirements: 2.1
 */
export const deleteAccount = async (): Promise<{ ok: boolean; message: string }> => {
  const headers = await buildAuthHeaders();

  if (!headers['Authorization']) {
    throw new Error('No active session');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any = null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/account`, {
      method: 'DELETE',
      headers,
    });

    try { payload = await response.json(); } catch { /* ignore */ }

    if (!response.ok) {
      throw new Error(
        payload?.error ||
        payload?.message ||
        `deleteAccount failed: HTTP ${response.status}`
      );
    }

    return payload;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('deleteAccount failed: network error');
  }
};

export interface AuditLogEntry {
  token_id: string;
  serial_number: string;
  score: number;
  trustExplanation: string | null;
  rationale: string;
  verified_at: string;
  status: "approved" | "flagged";
}

export interface AuditLogsPagination {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface AuditLogsResponse {
  ok: boolean;
  data: AuditLogEntry[];
  pagination: AuditLogsPagination;
}

export const getAuditLogs = async (params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  search?: string;
}): Promise<AuditLogsResponse> => {
  const { page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc", status = "all", search = "" } = params;
  
  const headers = await buildAuthHeaders();
  
  const { data: result, error } = await supabase.functions.invoke(
    "audit-logs",
    {
      method: "GET",
      queryParams: {
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
        status,
        search,
      },
      headers,
    }
  );

  if (error) {
    throw new Error(error.message || "Failed to fetch audit logs");
  }

  return result as AuditLogsResponse;
};
