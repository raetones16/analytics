import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../utils/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, config, secrets } = body;

    if (!type || !name || !config || !secrets) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("integrations")
      .insert([{ type, name, config, secrets }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ integration: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ integrations: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
