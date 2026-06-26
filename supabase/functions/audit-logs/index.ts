import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const sortBy = url.searchParams.get("sortBy") || "created_at";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const status = url.searchParams.get("status") || "all";
    const search = url.searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase
      .from("verifications")
      .select("token_id, serial_number, trace, created_at", { count: "exact" });

    // Filter by status (approved: trustScore >= 80, flagged: trustScore < 80)
    if (status === "approved") {
      query = query.not("trace->ai", "is", null).gte("trace->ai->>trustScore", "80");
    } else if (status === "flagged") {
      query = query.not("trace->ai", "is", null).lt("trace->ai->>trustScore", "80");
    }

    // Filter by search (case insensitive search in token_id)
    if (search) {
      query = query.ilike("token_id", `%${search}%`);
    }

    // Sorting
    const ascending = sortOrder === "asc";
    if (sortBy === "trustScore") {
      query = query.order("trace->ai->>trustScore", { ascending }).order("created_at", { ascending });
    } else {
      query = query.order(sortBy, { ascending });
    }

    // Pagination range
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    const logs = (data || []).map((item) => {
      const ai = item.trace?.ai || {};
      const score = Number(ai.trustScore ?? 0);
      return {
        token_id: item.token_id,
        serial_number: item.serial_number,
        score,
        trustExplanation: ai.trustExplanation || null,
        rationale: ai.trustExplanation || "Manual review recommended",
        verified_at: item.created_at,
        status: score >= 80 ? "approved" : "flagged",
      };
    });

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    return new Response(
      JSON.stringify({
        ok: true,
        data: logs,
        pagination: {
          totalRecords,
          totalPages,
          currentPage: page,
          limit,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Audit logs error:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Failed to fetch audit logs",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
