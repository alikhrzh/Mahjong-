import { patchNodeWebStorage } from "../scripts/patch-node-webstorage";

export function register() {
  patchNodeWebStorage();
}
