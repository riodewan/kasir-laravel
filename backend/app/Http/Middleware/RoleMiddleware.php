<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Normalisasi ke lowercase agar perbandingan case-insensitive
        $userRole = strtolower((string) $user->role);
        $roles    = array_map(fn ($r) => strtolower((string) $r), $roles);

        if (!in_array($userRole, $roles, true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
