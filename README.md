# AWS SBG Event Attendance Platform

Portable Member 2 check-in experience for the attendance platform described in the team workflow. The current development flow covers event display, venue-code gating, registration verification, the final attendance preview, optional location capture, and server-confirmed submission.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000` after the development server starts.

For the local fixture flow, open `/event/aws-cloud-workshop/check-in?ticket=live-aws-token` and verify with registration ID `AWS001`. Fixture endpoints are disabled in production; persistence and the shared attendance backend remain outside Member 2's module.

## Commands

```bash
npm run dev
npm run build
npm test
```

The commands use npm workspaces and relative paths, so the project can be cloned and run on Windows, macOS, or Linux.

## Repository map

- `apps/web` - Next.js participant and admin web application
- `apps/api` - Node API application boundary
- `modules/participant-import` - Member 1 boundary
- `modules/checkin-experience` - Member 2 boundary
- `modules/token-security` - Member 3 boundary
- `modules/attendance-admin` - Member 4 boundary
- `packages/ui` - shared UI primitives
- `packages/contracts` - shared request and response types
- `packages/validation` - common validation schemas
- `docs` - shared API, data-model, and operations documentation
- `fixtures` - safe development fixtures

Shared folders and contracts remain under Technical Lead control. Member 2 work is developed on `feature/member-2-checkin` and is limited to `modules/checkin-experience` plus explicitly approved integration points.
