import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

export type MemberProfileStatus = "pending" | "approved" | "rejected";

export type MemberProfile = {
  id: string;
  full_name: string;
  contact: string;
  country: string;
  role_title: string | null;
  about: string;
  building: string | null;
  looking_for: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  review_status: MemberProfileStatus;
  created_at: string;
  updated_at: string;
};

export type MemberProfileInput = {
  full_name: string;
  contact: string;
  country: string;
  role_title?: string;
  about: string;
  building?: string;
  looking_for?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
};

const PROFILE_COLUMNS =
  "id, full_name, contact, country, role_title, about, building, looking_for, website, twitter, linkedin, review_status, created_at, updated_at";

export async function fetchCurrentMemberProfile(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("member_profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    return {
      profile: null,
      error,
    };
  }

  return {
    profile: (data as MemberProfile | null) ?? null,
    error: null,
  };
}

export async function upsertMemberProfile(
  supabase: SupabaseClient,
  userId: string,
  input: MemberProfileInput,
) {
  const payload = {
    id: userId,
    full_name: input.full_name.trim(),
    contact: input.contact.trim(),
    country: input.country.trim(),
    role_title: normalizeOptional(input.role_title),
    about: input.about.trim(),
    building: normalizeOptional(input.building),
    looking_for: normalizeOptional(input.looking_for),
    website: normalizeOptional(input.website),
    twitter: normalizeOptional(input.twitter),
    linkedin: normalizeOptional(input.linkedin),
    review_status: "pending" as const,
  };

  const { error } = await supabase.from("member_profiles").upsert(payload, {
    onConflict: "id",
  });

  return { error };
}

export async function fetchApprovedMembers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("member_profiles")
    .select(PROFILE_COLUMNS)
    .eq("review_status", "approved")
    .order("created_at", { ascending: false });

  return {
    members: (data as MemberProfile[] | null) ?? [],
    error,
  };
}

export async function fetchMemberProfileById(
  supabase: SupabaseClient,
  profileId: string,
) {
  const { data, error } = await supabase
    .from("member_profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", profileId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    return {
      profile: null,
      error,
    };
  }

  return {
    profile: (data as MemberProfile | null) ?? null,
    error: null,
  };
}

export function resolveRouteByProfile(profile: MemberProfile | null) {
  if (!profile) {
    return "/onboarding";
  }

  if (profile.review_status === "approved") {
    return "/members";
  }

  return "/pending";
}

export function buildProfileTableHint(error: PostgrestError | null) {
  if (!error) {
    return null;
  }

  const message = error.message.toLowerCase();
  if (
    error.code === "42P01" ||
    (message.includes("member_profiles") && message.includes("does not exist"))
  ) {
    return "Table `member_profiles` is missing in Supabase. Run SQL setup first.";
  }

  return error.message;
}

function normalizeOptional(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
