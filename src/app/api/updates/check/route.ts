import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientVersion = searchParams.get("version");

    if (!clientVersion) {
      return NextResponse.json({ error: "Missing version parameter" }, { status: 400 });
    }

    const latestVersion = process.env.LATEST_DESKTOP_VERSION || "1.0.0";
    const downloadUrl = process.env.DESKTOP_DOWNLOAD_URL || "https://mms.lincoztech.com/downloads/lincoz-mms-setup.exe";

    // Simple semver comparison: version format X.Y.Z
    const clientParts = clientVersion.split(".").map(Number);
    const latestParts = latestVersion.split(".").map(Number);

    let updateAvailable = false;
    for (let i = 0; i < 3; i++) {
      const c = clientParts[i] || 0;
      const l = latestParts[i] || 0;
      if (l > c) {
        updateAvailable = true;
        break;
      } else if (c > l) {
        break;
      }
    }

    return NextResponse.json({
      updateAvailable,
      latestVersion,
      downloadUrl,
      changeLog: updateAvailable ? "Performance updates and database optimizations." : "",
    });
  } catch (error: any) {
    console.error("UPDATE_CHECK_ERROR", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
