# Security Specification — Korat Smart Agri Notification Center

## 1. Data Invariants
1. **Strict Ownership Isolation**: Every document in `/alertSubscriptions/{subscriptionId}` and `/alertLogs/{logId}` must belong to an authenticated, email-verified user (`request.auth != null && request.auth.token.email_verified == true`), and `ownerId` must strictly equal `request.auth.uid`.
2. **Path Variable Hardening**: Document IDs (`subscriptionId`, `logId`) and reference IDs (`ownerId`, `districtId`) must match `^[a-zA-Z0-9_\-]+$` with maximum length bounds.
3. **Immutable Audit Trail**: `ownerId`, `districtId`, and `createdAt` can never be mutated during an `update` operation.
4. **Server-Authoritative Timestamps**: `createdAt` must equal `request.time` on `create`, and `updatedAt` must equal `request.time` on both `create` and `update`.
5. **No Blanket Reads / Query Enforcer**: `allow list` rules strictly enforce `resource.data.ownerId == request.auth.uid`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Payload 1 (Identity Spoofing on Create)**: Creating an `alertSubscriptions` document where `ownerId` is set to another user's UID (`"victim-uid-999"`). -> `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Write)**: Creating an `alertSubscriptions` document with `email_verified: false`. -> `PERMISSION_DENIED`
3. **Payload 3 (Shadow/Ghost Field Injection on Create)**: Including an undeclared field `"isAdmin": true` in `/alertSubscriptions/{subscriptionId}`. -> `PERMISSION_DENIED`
4. **Payload 4 (Shadow Field Injection on Update)**: Updating an `alertSubscriptions` document with an extra field `"bypassQuota": true`. -> `PERMISSION_DENIED`
5. **Payload 5 (ID Poisoning / Oversized Document ID)**: Creating a document with a 300-character or special-character `$path` ID. -> `PERMISSION_DENIED`
6. **Payload 6 (Resource Exhaustion / 1MB String in Title)**: Creating an `alertLogs` document with a 5,000-character `message` exceeding `maxLength: 600`. -> `PERMISSION_DENIED`
7. **Payload 7 (Out-of-Bounds Numeric Threshold)**: Setting `spiThreshold: -99` or `rainProbThreshold: 250` outside valid meteorological ranges. -> `PERMISSION_DENIED`
8. **Payload 8 (Immutable Field Tampering on Update)**: Attempting to mutate `ownerId` or `createdAt` during an `update` on `/alertSubscriptions/{subscriptionId}`. -> `PERMISSION_DENIED`
9. **Payload 9 (Forged Client Timestamp)**: Supplying a past or future timestamp instead of `request.time` for `createdAt` or `updatedAt`. -> `PERMISSION_DENIED`
10. **Payload 10 (Unauthorized Cross-User Get)**: Authenticated User A attempting `get` on User B's `/alertSubscriptions/{subId}`. -> `PERMISSION_DENIED`
11. **Payload 11 (Unfiltered List Scraping)**: Authenticated User A running an unconstrained `list` query across `/alertLogs` without `where('ownerId', '==', uid)`. -> `PERMISSION_DENIED`
12. **Payload 12 (Invalid Enum Value on AlertLog)**: Creating an `alertLogs` document with `severity: "super_admin_override"`. -> `PERMISSION_DENIED`

## 3. Red Team Audit & Conflict Report
- **Collection `/alertSubscriptions/{subscriptionId}`**:
  - Identity Spoofing: Blocked (`data.ownerId == request.auth.uid` on create, `incoming().ownerId == existing().ownerId` on update).
  - State Shortcutting: Blocked via explicit action gates (`ToggleActiveAction` or `UpdateThresholdsAction`) using `affectedKeys().hasOnly(...)`.
  - Resource Poisoning: Blocked via `isValidId(subscriptionId)` and strict `.size()` bounds on every string field.
  - Value Poisoning: Blocked because `isValidAlertSubscription(incoming())` wraps the entire `allow update` expression.
- **Collection `/alertLogs/{logId}`**:
  - Identity Spoofing: Blocked (`data.ownerId == request.auth.uid`).
  - State Shortcutting: Updates are restricted strictly to marking `isRead` and `updatedAt` via `affectedKeys().hasOnly(['isRead', 'updatedAt'])`.
  - Resource Poisoning: Blocked via `isValidId(logId)` and strict `.size()` bounds on `title`, `message`, `metricSummary`.
  - Value Poisoning: Blocked because `isValidAlertLog(incoming())` wraps the entire `allow update` expression.
