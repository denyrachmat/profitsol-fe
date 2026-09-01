# MRS — Modular Reporting System

Connect to external databases, author SQL reports, simulate results, and manage report output.

## What It Does

Lets users register database connections, build reports from views, stored procedures, or custom SQL, validate them against a live preview, configure output columns/parameters, and view results in a dialog or a dedicated report page.

## Connection Management — `src/pages/MRS/addConnection.vue`

- Add/edit a database connection (name, host, username, password)
- **Test Connection** button (`mrs/checkConnection`)
- Saved per user (`mrs/dbconn`)

## Report List — `src/pages/MRS/indexMRS.vue`

- Lists the current user's connections and reports
- "Add Connection" and "Add Report" entry points
- Per-connection listing of report database metadata

## Report Builder — `src/pages/MRS/addReport.vue`

Multi-step wizard:

1. **Choose connection** (from registered DB connections)
2. **Choose method + table/view**
   - **Using View Function** (`view`)
   - **Using Store Procedure Function** (`sp`) — auto-builds `EXEC <proc> param=''` with SP parameters
   - **Write own query** (`query`)
3. **Write / edit query** — parameterized code; Monaco/Prism-based code editor (`editorCode.vue`)
4. **Validate & configure columns**
   - **Run simulation** (`mrs/simRunning`) — executes with latest 20 records and opens a preview (`simulationTablesReport.vue`)
   - Configure column labels, types (text / int / float / date / datetime), draggable column ordering
5. **Parameters** — define input parameters with types used to run the report

## Report Output

- `src/pages/MRS/ActionReport/viewReport.vue` — runs a report with its parameters and shows the result
- `src/pages/MRS/Tables/indexTableReport.vue` — table report page (route `/mrsReport/:idReport`)
- `src/pages/MRS/Tables/simulationTablesReport.vue` — simulation preview dialog
- `src/pages/MRS/Tables/colsManager.vue` — manage report columns
- `src/pages/MRS/Tables/apiStoreSearch.vue` — API/store search helper
- `src/pages/MRS/Tables/filterIndex.vue` — filter builder for reports

## Manage Reports — `src/pages/MRS/manageReport.vue`

- Rename/reconfigure saved reports
- Re-open the builder in edit mode (`dataEdit` prop)

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| Save connection | `mrs/dbconn` |
| Test connection | `mrs/checkConnection` |
| List databases | `mrs/...` (per connection) |
| List tables | `mrs/...tables` (per connection + db) |
| SP parameters | `mrs/...spParams` |
| Run simulation | `mrs/simRunning` |

## Key Files

```
src/pages/MRS/
├── indexMRS.vue
├── addConnection.vue
├── addReport.vue
├── manageReport.vue
├── editorCode.vue
├── ActionReport/viewReport.vue
└── Tables/
    ├── indexTableReport.vue
    ├── simulationTablesReport.vue
    ├── colsManager.vue
    ├── apiStoreSearch.vue
    └── filterIndex.vue
```