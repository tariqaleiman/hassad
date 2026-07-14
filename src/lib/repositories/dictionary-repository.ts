import { FirestoreRepository } from "./firestore-repository";
import type { ItemDictionaryEntry } from "../types/dictionary";

export class DictionaryRepository extends FirestoreRepository<ItemDictionaryEntry> {
  constructor() {
    super("item_dictionary");
  }
}

export const dictionaryRepository = new DictionaryRepository();
