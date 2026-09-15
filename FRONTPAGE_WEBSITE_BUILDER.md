# Front Page & Website Builder (UpdateFP)

Public-facing portal website with a visual page builder, navigation management, posts, categories, and subscribers.

## What It Does

The app can serve a fully customisable **front page** (per domain, `pd_is_cms == 2`) with its own header/footer, menus, pages, posts, tags and widgets. The **UpdateFP** module is the admin side that builds/edits that front page.

## Public Front Page — `src/pages/Frontpage/FrontPageIndex.vue`

- Full custom layout rendered from `mainConfData` (header color/logo/size, sidebar toggle, text color, etc.)
- Header actions: "To Portal" / "Login", "Edit Profile"
- Footer with menu + domain info
- Public routes:
  - `/` — front page root
  - `/pages/:slug/:url` — CMS page renderer (`src/pages/UpdateFP/pagesRedirect.vue`)
  - `/tags/:tag/:orderBy/:limit/:order` — posts by tag (`src/pages/Frontpage/listPostsByTags.vue`)
- Comments on posts: `src/pages/Frontpage/commentComponent.vue`

## Admin / Builder — `src/pages/UpdateFP/UpdateFPIndex.vue`

- Left menu of FP management sub-modules; **Preview Mode** renders `FrontPageIndex` live for editing
- Menu items map to component dialogs under `components/` (dynamically loaded via `import.meta.glob`)

### Sub-modules (`src/pages/UpdateFP/components/`)

| Sub-module | Files | Purpose |
|-----------|-------|---------|
| **Nav Manage** | `navManage/` (`indexNavManage`, `formNavManage`, `recurseNavOpt`) | Manage the front-page navigation tree |
| **Category Manage** | `categoryManage/` (`mappingCategoryManage`, `mappingCategoryView`) | Post categories / tags |
| **Page Manage** | `pageManage/` (`indexPageManage`, `CMSPageCreator`, `formCreatorDialog`, `blockRenderer`, `folderFilesChooser`) | Create/edit CMS pages with a block/widget system |
| **Post Manage** | `postManage/` (`indexPostManage`, `formAddPost`, `newFormAddPost`, `formSelectTags`, `tagsManageView`, `PdfEmbedView`) | Create/edit posts, attach tags, embed PDFs |
| **Set Web Manage** | `setWebManage/` (`indexSetWebManage`, `recurseWebOpt`) | Website-level settings/options |
| **Subscribe Manage** | `subscribeManage/` (`subscribeManage`, `subscriberIndex`) | Newsletter/subscriber management |

### Page Widgets (`pageManage/widgets/`)

Each widget has a `*Properties.vue` (config) and `*Renderer.vue` (render):

- Accordion, Button, Carousel, Columns, Countdown, Divider, Embed, Files, HTML, Image, Posts, QR Code, SharePoint, Spacer, Tabs, Text

## API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| Front page menu | `fpmanager/getFPMenu` |
| FP config (menu tree) | `authDet.is_fpconf` (loaded with user) |

## Key Files

```
src/pages/Frontpage/       FrontPageIndex, listPostsByTags, commentComponent
src/pages/UpdateFP/        UpdateFPIndex, listMenuRecurse, pagesRedirect
src/pages/UpdateFP/components/
  navManage, categoryManage, pageManage (+ widgets/*), postManage, setWebManage, subscribeManage
```