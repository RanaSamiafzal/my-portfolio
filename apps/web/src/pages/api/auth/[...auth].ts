import type { APIRoute } from "astro";
import { Auth } from "@auth/core";
import { oauthConfig } from "@/lib/oauth";

export const ALL: APIRoute = ({ request }) => Auth(request, oauthConfig());
