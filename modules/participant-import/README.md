# Participant Management

Reusable participant management logic for the Participant Import & Event Data
Admin module.

This module provides operations for searching, updating, and deactivating
`Participant` objects. The implementation has no database, API, or UI
dependencies.

## Operations

| Operation | Function | Description |
|---|---|---|
| Search | `searchParticipants` | Search participants by registration ID or name |
| Update | `updateParticipant` | Validate and apply editable participant fields |
| Deactivate | `deactivateParticipant` | Set a participant's status to `disabled` |

All operations return results without mutating the original participant
objects.

## Search

### `searchParticipants(participants, query)`

Searches a participant collection by registration ID or name.

```ts
const results = searchParticipants(participants, "REG001");

const byName = searchParticipants(participants, "aarav");

const all = searchParticipants(participants, "");
Matching rules:

registrationId uses exact matching after trimming the query.
name uses case-insensitive substring matching.
An empty or whitespace-only query returns all participants.

The input collection is not mutated.

Update
updateParticipant(participant, fields)

Updates supported participant fields after validation.

Editable fields:

name
email
phone
college
department
section
year
customFields

The following identity fields are protected:

id
eventId
registrationId

Validation rules:

name cannot be empty or whitespace-only.
year, when supplied, must be a positive integer.

Successful updates return:

{
  success: true,
  participant: Participant
}

Validation failures return:

{
  success: false,
  errors: UpdateError[]
}

The original participant object remains unchanged.

Deactivate
deactivateParticipant(participant)

Returns a new participant object with:

status = "disabled"

The original object is not modified.

Calling the function on an already-disabled participant is safe.

Participant Type

The functions operate on the project's Participant type defined in:

../types/participant.ts

Expected fields include:

interface Participant {
  id: string;
  eventId: string;
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  section: string;
  year: number;
  customFields: Record<string, unknown>;
  status: string;
}
Integration

The module operates on plain Participant objects.

A consuming application can:

Load participant data from its persistence layer.
Pass participant objects to these functions.
Handle the returned result.
Persist successful updates where required.

The module itself does not access a database or API.

Scope

This module contains participant record management only.

It does not implement:

CSV parsing
CSV validation
Participant import orchestration
Event CRUD
Attendance check-in
QR/token security
Authentication
Attendance dashboards
PDF generation
Participant-facing attendance pages
Testing

Tests for these operations are located in:

modules/participant-import/tests/

Run the complete participant-import test suite with:

npm test

---

# 2. Create `modules/participant-import/README.md`

This is the **main README** for your Member 1 module:

```md
# Participant Import & Event Data Admin

Member 1 module for event and participant administration in the Event
Attendance Platform.

The module provides participant CSV import, validation, duplicate detection,
normalization, participant management, and the corresponding administrative
interface.

## Responsibilities

The module covers:

- Event creation and editing
- Event status management
- Participant CSV import
- CSV parsing
- Participant validation
- Duplicate detection
- Participant normalization
- Import result reporting
- Participant search
- Participant editing
- Participant deactivation

## Structure

```text
participant-import/
├── fixtures/
│   ├── event.json
│   ├── participants-valid.csv
│   ├── participants-duplicates.csv
│   └── participants-invalid.csv
│
├── src/
│   ├── duplicate-detection/
│   ├── normalization/
│   ├── parser/
│   ├── participant-management/
│   ├── types/
│   ├── validation/
│   └── import-participants.ts
│
└── tests/
Participant Import Workflow
CSV File
   ↓
CSV Parsing
   ↓
Validation
   ↓
Duplicate Detection
   ↓
Normalization
   ↓
Import Result
   ↓
Participants Ready for Persistence

The import pipeline keeps parsing, validation, duplicate detection, and
normalization separate so that invalid or duplicate records can be identified
before they are imported.

CSV Parsing

The parser handles:

Required column detection
CSV field extraction
Quoted CSV values
Structured parser errors

Raw CSV parsing is kept separate from validation and persistence.

Validation

Participant rows are validated before normalization.

Validation includes checks for:

Registration ID
Participant name
Email format
Phone number format
Academic year
Required participant fields

Validation errors are returned as structured results so they can be displayed
by the administrative interface.

Duplicate Detection

The import process detects:

Duplicates within the uploaded file

Multiple rows containing the same registrationId are identified.

Duplicates against existing participants

Uploaded registration IDs can be compared against participants already
associated with the event.

The import result separates duplicate records from participants eligible for
creation.

Normalization

Valid rows are converted into the application's Participant structure.

Normalization handles:

Trimming input values
Converting year to a number
Initializing customFields
Setting the initial participant status
Participant Management

The participant-management module provides:

Operation	Function	Purpose
Search	searchParticipants	Search by registration ID or name
Update	updateParticipant	Update supported participant fields
Deactivate	deactivateParticipant	Disable a participant

The management functions operate on plain objects and do not access a database
or API.

See:

src/participant-management/README.md

for the detailed operation reference.

Administrative Interface

The Member 1 administrative interface provides:

Event Management
Event listing
Event creation
Event editing
Event status controls
Event details
Event deletion with confirmation
Participant Management
Participant listing
Search by registration ID or name
Participant editing
Registration ID protection
Participant deactivation
Responsive participant management
Participant Import
CSV file selection
Import preview
Validation results
Duplicate detection
Import summary
Successful participant creation

The preview stage allows import problems to be reviewed before confirmation.

Administrative Routes
Route	Purpose
/events	Event listing
/events/new	Create event
/events/[eventId]	Event details
/events/[eventId]/edit	Edit event
/events/[eventId]/participants	Participant management
/events/[eventId]/participants/import	Participant CSV import

The participant-facing attendance flow is handled separately.

Development Data

The administrative interface currently uses an in-memory store for local
development.

This allows the event and participant management interface to be tested
without a persistent backend.

Development data is reset when the application is restarted or refreshed.

Persistent database integration is outside the current local implementation
boundary.

Fixtures

The module includes fixtures for common import scenarios:

Fixture	Purpose
participants-valid.csv	Successful import
participants-duplicates.csv	Duplicate detection
participants-invalid.csv	Validation and error handling
event.json	Sample event data

These fixtures are intended for development and testing.

Testing

Automated tests cover:

CSV parsing
Validation
Duplicate detection
Normalization
Participant import
Participant search
Participant updates
Participant deactivation

Run the complete test suite with:

npm test
Development

Install dependencies:

npm install

Run the participant-import tests:

npm test

The administrative interface is located under:

apps/admin/
Integration Boundary

This module provides event and participant administration functionality.

It does not implement:

Attendance check-in
Rotating QR/token generation
Token replay protection
Geolocation verification
Attendance dashboard analytics
Attendance confirmation PDF generation
Participant-facing attendance pages
Authentication infrastructure

These concerns are implemented by their respective application modules.

Design Principles
Keep parsing, validation, normalization, and management logic separated.
Keep reusable participant logic independent of persistence.
Avoid mutating participant objects.
Return structured validation and import results.
Validate uploaded data before import.
Keep the module independently testable.

---

# 3. Then do the final check

From:

```powershell
cd D:\rakshclg\attendance

Run:

git status

Then:

git diff --check

Then run the tests:

cd modules\participant-import
npm test

You should get 8/8 passing.

Then:

cd ..\..\apps\admin
npm run build

You should get a successful Next build
Then go back:

cd ..\..
git status
IMPORTANT

Before staging, make sure you do NOT see:

node_modules/
.next/

Those are already covered by .gitignore.