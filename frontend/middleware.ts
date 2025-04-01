import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Get the user ID from cookies (middleware can't access localStorage)
    const userIdCookie = request.cookies.get("wingmanUserId");

    // Check if the user is logged in
    const isLoggedIn = userIdCookie?.value;

    // Define paths that don't require authentication
    const publicPaths = ["/login", "/register"];
    const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname === path);

    // Redirect to login if not logged in and trying to access protected route
    if (!isLoggedIn && !isPublicPath) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // If logged in and trying to access login page, redirect to home
    if (isLoggedIn && isPublicPath) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

// Configure which paths middleware will run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
