import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Calls a Supabase Edge Function with the signed-in user's session.
// The project URL and auth header come from the shared client, so no
// function URL is hardcoded per hook.
export async function invokeFunction<T>(name: string, body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });

  if (error) {
    // Surface the function's own { error } message when it sent one.
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null);
      throw new Error(payload?.error || `Request to ${name} failed`);
    }
    throw new Error(error.message);
  }

  return data as T;
}
