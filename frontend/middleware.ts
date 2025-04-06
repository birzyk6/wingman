import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware is currently not working because we use localStorage in the browser
// but middleware runs on the server and can't access localStorage.
// We'll disable it for now and rely on client-side auth checks.

export function middleware(request: NextRequest) {
    // Don't apply any redirects - let client-side handle authentication checks
    return NextResponse.next();
}

// Only apply middleware to specific API routes if needed
export const config = {
    matcher: ["/api/:path*"],
};
