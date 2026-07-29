import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization") || "";
    const publishableKeys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
    const publishableKey = publishableKeys.default || Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, publishableKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return json({ error: "يجب تسجيل الدخول أولاً" }, 401);

    const body = await req.json();
    const message = String(body.message || "").trim().slice(0, 12000);
    let conversationId = body.conversationId ? String(body.conversationId) : "";
    if (!message) return json({ error: "اكتب طلبك أولاً" }, 400);

    if (!conversationId) {
      const title = message.replace(/\s+/g, " ").slice(0, 55) || "محادثة جديدة";
      const { data, error } = await supabase.from("writer_conversations")
        .insert({ user_id: authData.user.id, title }).select("id").single();
      if (error) throw error;
      conversationId = data.id;
    } else {
      const { data } = await supabase.from("writer_conversations")
        .select("id").eq("id", conversationId).eq("user_id", authData.user.id).maybeSingle();
      if (!data) return json({ error: "المحادثة غير موجودة" }, 404);
    }

    const { error: userMessageError } = await supabase.from("writer_messages").insert({
      conversation_id: conversationId, user_id: authData.user.id, role: "user", content: message,
    });
    if (userMessageError) throw userMessageError;

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return json({
        conversationId,
        error: "الأداة جاهزة، وينقصها فقط إضافة مفتاح OpenAI السري في Supabase.",
        setupRequired: true,
      });
    }

    const [{ data: history }, { data: settings }] = await Promise.all([
      supabase.from("writer_messages").select("role,content").eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }).limit(30),
      supabase.from("writer_settings").select("system_instructions").eq("id", "default").single(),
    ]);

    const input = (history || []).map((item) => ({ role: item.role, content: item.content }));
    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MODEL") || "gpt-5.6-sol",
        instructions: settings?.system_instructions,
        input,
        reasoning: { effort: "low" },
        text: { verbosity: "medium" },
      }),
    });
    const result = await openAIResponse.json();
    if (!openAIResponse.ok) {
      if (result?.error?.code === "insufficient_quota" || /quota|billing/i.test(result?.error?.message || "")) {
        throw new Error("مفتاح OpenAI صحيح، لكن حساب API لا يحتوي رصيداً متاحاً. فعّل الفوترة أو أضف رصيداً ثم حاول مجدداً.");
      }
      throw new Error(result?.error?.message || "تعذر الاتصال بخدمة الكتابة");
    }
    const answer = String(result.output_text || "").trim();
    if (!answer) throw new Error("لم يصل رد من كاتب المحتوى");

    const { error: assistantError } = await supabase.from("writer_messages").insert({
      conversation_id: conversationId, user_id: authData.user.id, role: "assistant", content: answer,
    });
    if (assistantError) throw assistantError;
    await supabase.from("writer_conversations").update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId).eq("user_id", authData.user.id);

    return json({ conversationId, answer });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : "حدث خطأ غير متوقع" });
  }
});
