import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function base64URLEncode(str: Buffer) {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(32));
}

function generateCodeChallenge(codeVerifier: string) {
  return base64URLEncode(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );
}

export async function GET() {
  const clientId = process.env.SALESFORCE_CLIENT_ID;
  const redirectUri = process.env.SALESFORCE_REDIRECT_URI;
  const scope = "refresh_token api";
  const responseType = "code";

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Set code_verifier in a secure, httpOnly cookie
  const response = NextResponse.redirect(
    `https://login.salesforce.com/services/oauth2/authorize` +
      `?response_type=${encodeURIComponent(responseType)}` +
      `&client_id=${encodeURIComponent(clientId ?? "")}` +
      `&redirect_uri=${encodeURIComponent(redirectUri ?? "")}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}` +
      `&code_challenge_method=S256`,
    302
  );
  response.cookies.set("sf_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 300,
    sameSite: "lax",
  });
  return response;
}
