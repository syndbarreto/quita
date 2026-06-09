import { QUITA_STATUS } from "./constants.js";

export class QuitaCollection {
  constructor(items = []) {
    this.items = Array.isArray(items) ? items : [];
  }

  get vaultItems() {
    return this.items.filter((quita) => quita.status !== QUITA_STATUS.BLISS);
  }

  get newestVaultItems() {
    return [...this.vaultItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
}
