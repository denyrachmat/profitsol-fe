# RPA — Robotic Process Automation

Visual workflow builder for automating web and desktop tasks.

## What It Does

Configures **RPA server/runner entries** and the **command step libraries** that an RPA agent executes. Admins register automation servers, define reusable commands/steps, and attach typed parameters — forming the building blocks of visual web/desktop automation flows.

## RPA Server List — `src/pages/RPA/RPASetupView.vue`

- Table of RPA masters: Type, Host/Command, Port, Is Active, Description
- **Is Active** toggle per entry
- Add / Edit / Delete via `RPASetupManage.vue` dialog
- Data source: `rpa/rpaMaster`

## Setup Dialogs

| Dialog | Purpose |
|--------|---------|
| `RPASetupManage.vue` | Create/edit an RPA server / runner master entry |
| `RPASetupCommandManage.vue` | Manage the command step library (each command = a step an agent can run) |
| `RPASetupParameterManage.vue` | Manage typed parameters for a command step |
| `RPASetupView.vue` | List + CRUD for RPA masters |

## Visual Builder

- `RPACompRecursive.vue` — recursive component used to render nested RPA flow/step trees (command steps can contain child steps), the core of the visual workflow editor

## Key Files

```
src/pages/RPA/
├── RPASetupView.vue            # RPA server list + CRUD
├── RPASetupManage.vue          # add/edit server
├── RPASetupCommandManage.vue   # command/step library
├── RPASetupParameterManage.vue # step parameters
└── RPACompRecursive.vue        # recursive visual step tree
```

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| List / CRUD RPA masters | `rpa/rpaMaster` |