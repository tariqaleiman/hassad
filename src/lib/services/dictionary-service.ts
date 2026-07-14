import { dictionaryRepository } from "../repositories/dictionary-repository";
import type { ItemDictionaryEntry, ItemDictionaryFormValues } from "../types/dictionary";

export const dictionaryService = {
  createEntry: async (
    data: ItemDictionaryFormValues,
    userId: string
  ): Promise<ItemDictionaryEntry> => {
    return dictionaryRepository.create({ ...data, userId }, userId);
  },

  updateEntry: async (
    id: string,
    data: Partial<ItemDictionaryFormValues>,
    userId: string
  ): Promise<ItemDictionaryEntry> => {
    return dictionaryRepository.update(id, data, userId);
  },

  deleteEntry: async (id: string, userId: string): Promise<void> => {
    return dictionaryRepository.delete(id, userId);
  },

  listEntries: async (userId: string): Promise<ItemDictionaryEntry[]> => {
    return dictionaryRepository.getByField("userId", userId);
  },
  
  generateDisplayName: (entry: ItemDictionaryEntry | ItemDictionaryFormValues): string => {
    const parts = [entry.mainType];
    if (entry.subType) parts.push(entry.subType);
    if (entry.variety) parts.push(entry.variety);
    return parts.join(" - ");
  }
};
