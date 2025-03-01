import { createClient } from "@supabase/supabase-js";

export async function POST(req: any) {
  try {
    const { email, isAdmin } = await req.json();

    // Ensure only admin can send emails
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
      });
    }

    // Initialize Supabase with Service Role Key (Backend Only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SERVICE_KEY! // Must be kept in .env and never exposed in frontend
    );

    // Send Email Invite
    const { error } = await supabase.auth.admin.inviteUserByEmail(email);
    if (error) throw error;

    return new Response(JSON.stringify({ message: "Invitation sent!" }), {
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
}
