import { QUITA_STATUS } from "./constants.js";
import { Quita } from "./Quita.js";

export class QuitaCollection {
  #items;

  constructor(items = []) {
    this.#items = Array.isArray(items) ? items.map(Quita.fromServerRecord) : [];
  }

  get items() {
    return [...this.#items];
  }

  get vaultItems() {
    return this.#items.filter((quita) => quita.status !== QUITA_STATUS.BLISS);
  }

  get newestVaultItems() {
    return [...this.vaultItems].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  get blissItems() {
    return this.#items.filter((quita) => quita.status === QUITA_STATUS.BLISS);
  }

  get newestBlissItems() {
    return [...this.blissItems].sort((a, b) => {
      const dateA = new Date(a.releasedAt || a.createdAt);
      const dateB = new Date(b.releasedAt || b.createdAt);

      return dateB - dateA;
    });
  }
}
