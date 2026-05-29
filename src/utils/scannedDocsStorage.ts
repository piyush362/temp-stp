import AsyncStorage from '@react-native-async-storage/async-storage';

const SCANNED_DOCS_KEY = '@stapples_scanned_docs';

export interface ScannedDocItem {
  id: string;
  name: string;
  path: string;
  size: number;
  date: string;
  pageCount?: number;
}

/**
 * Get all scanned documents from AsyncStorage
 */
export const getScannedDocs = async (): Promise<ScannedDocItem[]> => {
  try {
    const json = await AsyncStorage.getItem(SCANNED_DOCS_KEY);
    if (json) {
      return JSON.parse(json) as ScannedDocItem[];
    }
    return [];
  } catch (error) {
    console.error('Error reading scanned docs from AsyncStorage:', error);
    return [];
  }
};

/**
 * Save the full scanned documents array to AsyncStorage
 */
export const saveScannedDocs = async (
  docs: ScannedDocItem[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(SCANNED_DOCS_KEY, JSON.stringify(docs));
  } catch (error) {
    console.error('Error saving scanned docs to AsyncStorage:', error);
  }
};

/**
 * Add a single scanned document to the front of the list
 */
export const addScannedDoc = async (doc: ScannedDocItem): Promise<void> => {
  try {
    const existing = await getScannedDocs();
    const updated = [doc, ...existing];
    await saveScannedDocs(updated);
  } catch (error) {
    console.error('Error adding scanned doc to AsyncStorage:', error);
  }
};

/**
 * Remove a scanned document by its id
 */
export const removeScannedDoc = async (docId: string): Promise<void> => {
  try {
    const existing = await getScannedDocs();
    const updated = existing.filter(d => d.id !== docId);
    await saveScannedDocs(updated);
  } catch (error) {
    console.error('Error removing scanned doc from AsyncStorage:', error);
  }
};
