import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const respond = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authorization = req.headers.get("Authorization") || "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    if (!token) return respond({ error: "يجب تسجيل الدخول أولًا." }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const caller = createClient(url, anonKey);
    const { data: { user }, error: userError } = await caller.auth.getUser(token);
    if (userError || !user) return respond({ error: "انتهت جلسة الدخول. سجّل الدخول مجددًا." }, 401);

    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .single();
    if (profileError || profile?.role !== "admin" || profile?.status !== "active") {
      return respond({ error: "هذه العملية متاحة للمدير النشط فقط." }, 403);
    }

    const body = await req.json();
    const role = body.role === "admin" ? "admin" : "employee";
    const status = body.status === "suspended" ? "suspended" : "active";

    if (body.action === "create") {
      if (!body.email || !body.password || !body.name || !body.username) {
        return respond({ error: "أكمل جميع البيانات المطلوبة." }, 400);
      }
      const { data, error } = await admin.auth.admin.createUser({
        email: String(body.email).trim().toLowerCase(),
        password: String(body.password),
        email_confirm: true,
        user_metadata: {
          full_name: String(body.name).trim(),
          username: String(body.username).trim(),
          department: String(body.department || "").trim(),
        },
        app_metadata: {
          sweater_role: role,
          sweater_status: status,
        },
      });
      if (error) throw error;

      const { error: updateError } = await admin.from("profiles").update({
        full_name: String(body.name).trim(),
        username: String(body.username).trim(),
        email: String(body.email).trim().toLowerCase(),
        department: String(body.department || "").trim() || null,
        role,
        status,
      }).eq("id", data.user.id);
      if (updateError) {
        await admin.auth.admin.deleteUser(data.user.id);
        throw updateError;
      }
      return respond({ user: { id: data.user.id, email: data.user.email } }, 201);
    }

    if (body.action === "update") {
      if (!body.id || !body.name || !body.username) return respond({ error: "بيانات الموظف غير مكتملة." }, 400);
      const { error } = await admin.from("profiles").update({
        full_name: String(body.name).trim(),
        username: String(body.username).trim(),
        department: String(body.department || "").trim() || null,
        role,
        status,
      }).eq("id", body.id);
      if (error) throw error;
      return respond({ ok: true });
    }

    if (body.action === "delete") {
      if (!body.id) return respond({ error: "معرّف الموظف غير صالح." }, 400);
      if (body.id === user.id) return respond({ error: "لا يمكنك حذف حسابك أثناء استخدامه." }, 400);
      const { error } = await admin.auth.admin.deleteUser(body.id);
      if (error) throw error;
      return respond({ ok: true });
    }

    return respond({ error: "العملية المطلوبة غير معروفة." }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تنفيذ الطلب.";
    return respond({ error: message }, 400);
  }
});
