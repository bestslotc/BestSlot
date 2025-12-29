# Crash Game Backend Integration - TODO

This document outlines the steps to integrate the Crash game with a backend for secure balance management and server-side game logic, transforming it into a secure single-player experience.

## High-Level Plan

1.  **Backend API Setup:** Create new API endpoints that handle balance retrieval, placing bets, and cashing out. These will interact with your database (Neon DB). The crucial `generateCrashPoint` logic will also move to the backend.
2.  **Frontend Adaptation:** Modify your existing React components and `useCrashGame` hook to communicate with these new backend APIs. The frontend will become a display layer that sends user actions and renders server-provided game state and balance.

## Detailed Steps

### Backend Integration

*   **Create API Route for Fetching User Balance:**
    *   Create a new API route (e.g., `app/api/users/balance/route.ts`) to securely fetch the user's current balance from the database.
    *   This API should return the current balance for the authenticated user.
*   **Create API Route for Placing a Bet:**
    *   Create a new API route (e.g., `app/api/games/crash/bet/route.ts`).
    *   This endpoint will:
        *   Receive bet amount and user identifier.
        *   Validate the bet against the user's current balance.
        *   Deduct the bet amount from the user's balance in the database.
        *   Generate a unique server-side `crashPoint` using logic similar to `generateCrashPoint` but on the server.
        *   Store the game session details (e.g., `gameSessionId`, `crashPoint`, `betAmount`, `userId`) in the database.
        *   Return a `gameSessionId` and the initial game state (e.g., multiplier starting at 1.0x).
*   **Create API Route for Cashing Out:**
    *   Create a new API route (e.g., `app/api/games/crash/cashout/route.ts`).
    *   This endpoint will:
        *   Receive the `gameSessionId` and the `multiplierAtCashout` from the client.
        *   Validate the `gameSessionId` and ensure the game is still active and hasn't already crashed on the server.
        *   Calculate the winnings based on the `betAmount` and `multiplierAtCashout` (retrieved from the stored `gameSessionId`).
        *   Add the winnings to the user's balance in the database.
        *   Mark the `gameSession` as completed/cashed out in the database.
        *   Return the updated user balance and the winnings.
*   **Move `generateCrashPoint` Logic to Backend:**
    *   Ensure that the `generateCrashPoint` logic is *only* executed on the server within the "place bet" API route.
    *   The client should not have access to this function to prevent manipulation.

### Frontend Adaptation

*   **Remove Client-Side `generateCrashPoint`:**
    *   Delete or comment out the `generateCrashPoint` function in `app/games/crash/lib/crash-logic.ts`.
*   **Refactor `useCrashGame` Hook:**
    *   **Fetch Initial Balance:** In `useCrashGame`, replace the `useState(initialBalance)` with a call to the new "fetch user balance" API. Use a loading state while fetching.
    *   **`placeBet` Modification:**
        *   When `placeBet` is called, make an API call to the new "place bet" backend endpoint, sending the `betAmount`.
        *   Upon a successful response, update the local `balance` state with the new, reduced balance from the backend.
        *   Store the `gameSessionId` received from the backend in the component's state.
        *   The client-side `gameState` should transition to 'running', and the `multiplier` should start incrementing locally.
    *   **`cashOut` Modification:**
        *   When `cashOut` is called, make an API call to the new "cash out" backend endpoint, sending the `gameSessionId` and the current `multiplier.get()`.
        *   Upon a successful response, update the local `balance` state with the new balance from the backend.
        *   Handle potential errors (e.g., if the game already crashed on the server).
    *   **Game Loop Logic Adjustment:**
        *   The client-side `multiplier` will continue to increment locally for visual effect.
        *   The client will *not* know the server-side `crashPoint` until the backend decides the round is over (either via a cashout or a crash).
        *   When the local multiplier exceeds the server-determined `crashPoint` (which the backend would communicate if the player *didn't* cash out), the client should visually crash the game. This means the client needs to receive the `crashPoint` from the server *after* a bet is placed, allowing the client to run its visual simulation up to that point.
*   **Update `page.tsx`:**
    *   Ensure the `useCrashGame` hook receives the user's initial balance from the API (once implemented).
    *   Display the balance and game state correctly, reflecting the data provided by the backend APIs.