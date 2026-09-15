const variables = [
  {
    name: "user_fullname",
    label: "User Full Name",
    group: "User",
    resolve: (store) => {
      const d = store.getDetail;
      if (!d?.user_det) return "";
      return `${d.user_det.pud_first_name || ""} ${d.user_det.pud_last_name || ""}`.trim();
    },
  },
  {
    name: "user_firstname",
    label: "First Name",
    group: "User",
    resolve: (store) => store.getDetail?.user_det?.pud_first_name || "",
  },
  {
    name: "user_lastname",
    label: "Last Name",
    group: "User",
    resolve: (store) => store.getDetail?.user_det?.pud_last_name || "",
  },
  {
    name: "user_email",
    label: "Email",
    group: "User",
    resolve: (store) => store.authDet?.username || "",
  },
  {
    name: "user_photo",
    label: "Profile Photo URL",
    group: "User",
    resolve: (store) => store.getDetail?.user_det?.pud_photo || "",
  },
  {
    name: "user_role",
    label: "Current Role",
    group: "User",
    resolve: (store) => store.getChoosedRole?.role?.rm_role_name || "",
  },
  {
    name: "current_date",
    label: "Current Date",
    group: "Date & Time",
    resolve: () =>
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
  },
  {
    name: "current_year",
    label: "Current Year",
    group: "Date & Time",
    resolve: () => new Date().getFullYear().toString(),
  },
  {
    name: "current_time",
    label: "Current Time",
    group: "Date & Time",
    resolve: () =>
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
  },
];

/**
 * Resolve all {{$variableName}} tokens in htmlString.
 * @param {string} html - raw HTML content
 * @param {object} authStore - Pinia auth store instance
 * @returns {string} HTML with resolved variables
 */
export function resolveVariables(html, authStore) {
  if (!html) return "";
  return html.replace(/\{\{\$(\w+)\}\}/g, (match, varName) => {
    const v = variables.find((x) => x.name === varName);
    if (!v) return match;
    try {
      return v.resolve(authStore);
    } catch {
      return match;
    }
  });
}

/**
 * Format a variable name as a template token.
 * @param {string} varName - variable name without {{$}}
 * @returns {string} e.g. "{{$user_fullname}}"
 */
export function varToken(varName) {
  return `{{\$${varName}}}`;
}

export default variables;
