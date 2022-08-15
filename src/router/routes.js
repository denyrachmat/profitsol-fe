/* eslint-disable */
const routes = [
  {
    path: "/login",
    component: () => import("pages/Auth"),
    children: [{ path: "", component: () => import("pages/Auth/index.vue") }],
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
    name: "apps",
    component: () => import("pages/Dashboards/viewApps.vue"),
    children: [
      {
        path: "uploadDocument",
        name: "apps",
        component: () => import("pages/DMS/uploadDocument.vue"),
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
