/**
 * Resolve role-scoped default filter setups into a flat MRS filter array.
 *
 * Each setup is `{ roles: [roleId...] | undefined, cols, value, type, opr, conmet }`.
 * Entries without `roles` apply to everyone (backward compatible).
 * All matching entries are combined (AND), preserving their relative order.
 *
 * @param {Array} setups  defaultFilterData from the form setup
 * @param {string|number|null} currentRoleId  authStore.getChoosedRole?.role?.id
 * @returns {Array} flat filter array ready for the MRS `filter` param
 */
export const resolveRoleFilters = (setups, currentRoleId) => {
  if (!Array.isArray(setups) || setups.length === 0) return [];

  return setups.filter((entry) => {
    const roles = entry?.roles;
    if (!Array.isArray(roles) || roles.length === 0) return true;
    if (currentRoleId === null || currentRoleId === undefined || currentRoleId === "") return false;
    return roles.some((r) => String(r) === String(currentRoleId));
  });
};

export default resolveRoleFilters;
