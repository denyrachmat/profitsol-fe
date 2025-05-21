/* eslint-disable */
const routes = [
  {
    path: "/login",
    component: () => import("pages/Auth"),
    children: [{ path: "", component: () => import("pages/Auth/index.vue"), name: 'login' }],
  },
  {
    path: "/reset-password/:token",
    component: () => import("pages/Auth"),
    children: [{ path: "", component: () => import("pages/Auth/resetPassword.vue"), name: 'reset' }],
  },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Dashboards/index.vue") },
    ],
  },
  {
    path: "/profiles",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Profiles/index.vue") },
    ],
  },
  {
    path: "/mrsReport/:idReport",
    children: [
      { path: "", component: () => import("pages/MRS/Tables/indexTableReport.vue") },
    ],
  },
  {
    path: "/forms/:linkID", component: () => import("pages/CMS/formsAsApps.vue")
  },
  {
    path: "/showHTMLTraining",
    component: () => import("pages/CMS/Training/showHTMLTraining.vue"),
  },
  {
    path: "/settings/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "users",
        component: () => import("pages/Settings/Users/index.vue"),
      },
      {
        path: "menu",
        component: () => import("pages/Settings/Apps/index.vue"),
      },
      {
        path: "role",
        component: () => import("pages/Settings/Role/index.vue"),
      },
    ],
  },
  {
    path: "/dms/",
    name: "dms",
    // component: () => import("pages/Dashboards/viewApps.vue"),
    children: [
      {
        path: "show/:token/:id?",
        name: "dms",
        component: () => import("pages/DMS/uploadDocument.vue"),
      },
    ],
  },
  {
    path: "/ams/",
    name: "apps",
    // component: () => import("pages/Dashboards/viewApps.vue"),
    children: [
      {
        path: "approvalAction/:token/:tokenHist/:mode?",
        name: "apps",
        component: () => import("pages/AMS/approvalUpdate.vue"),
      },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
