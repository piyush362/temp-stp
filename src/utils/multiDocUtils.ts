import { Platform, Alert } from 'react-native';
import { pick } from '@react-native-documents/picker';
import RNFetchBlob from 'react-native-blob-util';

// ===============================
// TYPES
// ===============================
export interface PickedFile {
  id: string;
  fileUri: string;
  fileName: string;
  mimeType: string;
  formData: FormData;
  fileType: 'pdf' | 'image' | 'docx';
}

// ===============================
// MAIN PICKER FUNCTION
// ===============================
export const handleGenericDocumentPicker = async (): Promise<PickedFile[]> => {
  try {
    const pickResults = await pick({ allowMultiSelection: true });

    if (!pickResults || pickResults.length === 0) return [];

    const supportedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/heic',
      'image/heif',
      'image/webp',
    ];

    const processedFiles: PickedFile[] = [];

    for (let item of pickResults) {
      if (!item?.uri) continue;

      let fileUri = item.uri;
      let mimeType = item.type || '';
      let fileName = item.name || 'file';

      // ===========================
      //  FIX MIME WHEN MISSING
      // ===========================
      if (!mimeType || mimeType === '') {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';

        const extMap: any = {
          pdf: 'application/pdf',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          png: 'image/png',
          heic: 'image/heic',
          heif: 'image/heif',
          webp: 'image/webp',
        };

        mimeType = extMap[ext] || 'application/octet-stream';
      }

      // ===========================
      //   CHECK SUPPORT
      // ===========================
      if (!supportedMimeTypes.includes(mimeType)) {
        Alert.alert('Unsupported File Type', 'Allowed: PDF, Images, DOCX');
        continue;
      }

      // ===========================
      //   DETERMINE FILE TYPE
      // ===========================
      let fileType: 'pdf' | 'image' | 'docx';
      if (mimeType === 'application/pdf') fileType = 'pdf';
      else if (mimeType.includes('officedocument')) fileType = 'docx';
      else fileType = 'image';

      // ===========================
      //  SANITIZE FILENAME
      // ===========================
      const sanitizedName = fileName
        .replace(/\s+/g, '-') // spaces → hyphens
        .replace(/[^a-zA-Z0-9.\-_]/g, '') // invalid chars
        .replace(/--+/g, '-') // multiple hyphens
        .replace(/^-+|-+$/g, ''); // trim

      fileName = sanitizedName || `upload.${mimeType.split('/')[1] || 'bin'}`;

      // ===========================
      //  ANDROID content:// FIX
      // ===========================
      if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
        try {
          const dest = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;
          await RNFetchBlob.fs.cp(fileUri, dest);
          fileUri = `file://${dest}`;
        } catch (e) {
          console.warn('Android path copy failed', e);
        }
      }

      // ===========================
      //  FORMDATA
      // ===========================
      const formData = new FormData();
      formData.append('document', {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      } as any);

      processedFiles.push({
        id: Date.now().toString() + Math.random(),
        fileUri,
        fileName,
        mimeType,
        fileType,
        formData,
      });
    }

    return processedFiles;
  } catch (error) {
    console.error('Picker Error:', error);
    Alert.alert('Error picking document');
    return [];
  }
};
