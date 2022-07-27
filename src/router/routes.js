/* eslint-disable */
const routes = [
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
    path: "/login",
    component: () => import("pages/Auth"),
    // children: [
    //   { path: '', component: () => import('pages/Index.vue') }
    // ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
