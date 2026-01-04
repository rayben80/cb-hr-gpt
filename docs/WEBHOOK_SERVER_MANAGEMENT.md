# Webhook Server Management Plan

This document outlines how to move Google Chat webhook handling from client storage
to server-managed configuration.

## Goals
- Prevent webhook URLs from being stored in localStorage.
- Allow centralized rotation and auditing of webhook endpoints.
- Reduce client-side exposure of sensitive URLs.

## Proposed Architecture
- Add a backend endpoint that proxies notifications.
- Store webhook URLs in server-side configuration (env, secret manager, or DB).
- Restrict access to the proxy endpoint via auth/roles.

## API Contract (Example)
- POST /api/notifications/google-chat
  - Body: { type, title, message, targetUsers, dueDate }
  - Auth: bearer token or session cookie
  - Returns: { success: boolean, requestId: string }

## Client Changes
- Replace direct fetch to Google Chat webhook with a call to the proxy endpoint.
- Remove or disable webhook URL input in UI when server config is active.
- Keep the existing UI for dev/testing if no server endpoint is configured.

## Client Config (Env)
- `VITE_NOTIFICATION_PROXY_URL`: client sends notifications to this proxy.

## Firebase Functions Quick Start
1) Set the webhook URL (recommended via config):
   - `firebase functions:config:set googlechat.webhook_url="https://chat.googleapis.com/v1/spaces/.../messages?key=...&token=..."`
2) (Optional) Lock down origins:
   - `firebase functions:config:set proxy.allowed_origins="http://localhost:5178,https://your-domain.example"`
3) Deploy:
   - `firebase deploy --only functions`
4) Use the function URL as `VITE_NOTIFICATION_PROXY_URL`:
   - `https://<region>-<project>.cloudfunctions.net/googleChatProxy`

## Cloudflare Workers Quick Start (Free)
1) Install Wrangler:
   - `npm install -g wrangler`
2) Login:
   - `wrangler login`
3) Configure secrets and vars:
   - `wrangler secret put GOOGLE_CHAT_WEBHOOK_URL`
   - `wrangler secret put FIREBASE_PROJECT_ID`
   - `wrangler secret put ALLOWED_ORIGINS`
4) Deploy from `workers/google-chat-proxy`:
   - `npm install`
   - `wrangler deploy`
5) Use the Worker URL as `VITE_NOTIFICATION_PROXY_URL`

Note: The Worker expects a Firebase ID token in the `Authorization: Bearer` header.

## Server Responsibilities
- Validate payload shape.
- Enforce rate limits.
- Handle retries with backoff.
- Record audit logs (who triggered, when, payload summary).

## Rollout Plan
1) Implement proxy endpoint with a test-only mode.
2) Add feature flag to switch client between direct webhook and proxy.
3) Move production to proxy; remove any client-side webhook storage.

## Open Questions
- Where to store webhook URLs (env vs DB)?
- Required auth scope for sending notifications?
- Retention policy for audit logs?
