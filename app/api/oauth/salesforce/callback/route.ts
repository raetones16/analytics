import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../utils/supabaseClient";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.json(
      { error: "Missing code parameter" },
      { status: 400 }
    );
  }

  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
  const redirectUri = process.env.SALESFORCE_REDIRECT_URI;

  // Read code_verifier from cookie
  const codeVerifier = req.cookies.get("sf_code_verifier")?.value;
  if (!codeVerifier) {
    return NextResponse.json(
      { error: "Missing PKCE code_verifier" },
      { status: 400 }
    );
  }

  const tokenUrl = "https://login.salesforce.com/services/oauth2/token";
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId ?? "",
    client_secret: clientSecret ?? "",
    redirect_uri: redirectUri ?? "",
    code_verifier: codeVerifier,
  });

  try {
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: tokenData.error_description || "Failed to get tokens" },
        { status: 400 }
      );
    }
    // Store integration in Supabase
    const { instance_url, refresh_token } = tokenData;
    // Use a placeholder start_date for now
    const start_date = new Date().toISOString().slice(0, 10);
    const { error: dbError } = await supabase.from("integrations").insert([
      {
        type: "salesforce",
        name: "Salesforce",
        config: {
          instance_url,
          start_date,
          api_type: "REST",
          select_fields_by_default: true,
        },
        secrets: {
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token,
        },
        status: "connected",
      },
    ]);
    // Clean up the code_verifier cookie
    const baseUrl = req.nextUrl.origin;
    const response = NextResponse.redirect(
      `${baseUrl}/integrations?connected=salesforce`,
      302
    );
    response.cookies.set("sf_code_verifier", "", { maxAge: 0, path: "/" });
    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
