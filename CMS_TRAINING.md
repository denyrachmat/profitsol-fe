# CMS & Training (TOS)

Content creation, forms/quiz builder, training courses, and result tracking.

## What It Does

Two tightly-coupled modules:
- **CMS** — content editing (TinyMCE / TipTap), dynamic **forms & quizzes** builder that can be published as standalone apps or embedded in the portal.
- **TOS (Training)** — timed quizzes taken from CMS forms, plus completion/history dashboards.

## Rich Text Editing

- TinyMCE wrapper: `src/components/editors/tinyEditor.vue`
- TipTap-based editors with StarterKit + extensions (tables, images, code blocks, task lists, links, underline, highlight, text-align, resize-image)
- CMS page shell: `src/pages/CMS/indexCMS.vue`

## Forms & Quiz Builder — `src/pages/CMS/FormsCreator/indexFormsCreator.vue`

Menu bar with:
- **File**: New Forms, Open (CTRL+O), Save (CTRL+S)
- **Action**: Test your question (preview), Setting this question bank, Share this question, Review All Logics, Download Backup (.json), Restore from Backup, Delete Form
- **Trash** (soft-deleted forms)

Supporting views:

| View | Purpose |
|------|---------|
| `viewSetupForms.vue` | Configure the form / question bank |
| `viewLogicForms.vue` | Form flow logics |
| `viewLogicsAll.vue` / `viewLogicsHeaderForms.vue` | View all logics / header-level logics |
| `viewSetupAPIDest.vue` | Set API destination for submitted answers |
| `viewSetupFieldPerms.vue` | Field permissions |
| `viewSetupHistTable.vue` | History table setup |
| `viewSetupKeysBulk.vue` | Bulk key setup |
| `viewTrashForms.vue` | Restore / permanently delete forms |

### Form Components

- Add content components (`addContentComponent.vue`), choose components (`chooseComponent.vue`), component viewer (`componentView.vue`)
- API-backed components & parameters (`addAPIComponentOptions.vue`, `addAPIParamByComponent.vue`)

### Render Forms as Apps

- Route `/forms/:linkID` → `src/pages/CMS/formsAsApps.vue` — renders a published form standalone
- `showComponent.vue`, `showComponentAsChecklist.vue`, `showLogicForms.vue`, `showLogicField.vue`, `showHistory.vue`
- Quiz rendering: `showQuizComponent.vue`, results: `showQuizResult.vue`, `showQuizResultDialog.vue`
- Preview & share: `previewComponent.vue`, `shareForms.vue`

## Training (TOS)

- **Training list** — `src/pages/TOS/indexTOS.vue` (placeholder) and `src/pages/TOS/indexList.vue` (table of all trainings with PASSED/FAILED badges, quiz start/end, last answers, total tries, grade, status, and a view-result action)
- **Setup & run** — `src/pages/CMS/Training/setupTraining.vue`, `openTraining.vue`, `indexTraining.vue`
- **HTML training** — `showHTMLTraining.vue` (route `/showHTMLTraining`)
- **Completion dashboard** — `src/pages/CMS/Training/completionDashboard.vue`
- **Results** — `src/pages/TOS/Report/historicalAnswers.vue` and `src/pages/TOS/Quiz/showLiveForms.vue`

## Dashboard Integration

`src/pages/Dashboards/index.vue` Training List panel (`informationList.vue`) lets users launch quizzes from posted front-page items (`cfmt_quiz_flag == 1`), validates quiz expiry, and opens them in a dialog app window.

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| List trainings | `tos/training` |
| Forms/quiz save/share | `cf_forms`, `cf_forms_share`, etc. |
| Quiz results | `showQuizResult` API group |

## Key Files

```
src/pages/CMS/
├── indexCMS.vue
├── formsAsApps.vue
├── FormsCreator/ (viewSetupForms, viewLogicForms, viewTrashForms, ...)
├── Forms/ (showComponent*, showQuiz*, showHistory, shareForms, ...)
├── Training/ (indexTraining, openTraining, setupTraining, showHTMLTraining, completionDashboard)
src/pages/TOS/
├── indexTOS.vue / indexList.vue
├── TrainingReport.vue
├── Quiz/showLiveForms.vue
└── Report/historicalAnswers.vue
```