import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  listing: ["create", "update", "delete", "publish"],
  dealership: ["manage"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  listing: ["create", "update", "delete", "publish"],
});

export const dealer = ac.newRole({
  listing: ["create", "update", "delete", "publish"],
  dealership: ["manage"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  listing: ["create", "update", "delete", "publish"],
  dealership: ["manage"],
});
