import { Platform, Alert } from 'react-native';
import { pick } from '@react-native-documents/picker';
import RNFetchBlob from 'react-native-blob-util';

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const handleGenericDocumentPicker = async () => {
  try {
    const [pickResult] = await pick();

    if (!pickResult?.uri) {
      throw new Error('No file picked');
    }

    let fileSize = pickResult.size;

    // fallback for Android (size sometimes missing)
    if (!fileSize && pickResult.uri) {
      try {
        const stats = await RNFetchBlob.fs.stat(pickResult.uri);
        fileSize = Number(stats.size);
      } catch (e) {
        console.warn('Could not get file size', e);
      }
    }

    if (fileSize && fileSize > MAX_SIZE_BYTES) {
      Alert.alert(`File exceeds ${MAX_SIZE_MB} MB limit`);
      return null;
    }

    let fileUri = pickResult.uri;
    let mimeType = pickResult.type;
    let fileName = pickResult.name || 'file';

    // --- NEW: Sanitize the filename to remove spaces and problematic characters ---
    // 1. Replace spaces with hyphens
    // 2. Remove any characters that are not alphanumeric, hyphen, underscore, or a dot (for extension)
    // 3. Ensure multiple hyphens don't appear consecutively
    // 4. Handle leading/trailing hyphens (optional but good practice)
    const sanitizedFileName = fileName
      .replace(/\s+/g, '-') // Replace one or more spaces with a single hyphen
      .replace(/[^a-zA-Z0-9.\-_]/g, '') // Remove all non-alphanumeric, non-hyphen, non-underscore, non-dot characters
      .replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading or trailing hyphens

    // If sanitization results in an empty string, provide a fallback
    // if (!sanitizedFileName) {
    //   const extension = fileName.split('.').pop();
    //   fileName = `file-upload${extension ? `.${extension}` : ''}`;
    // } else {
    //   fileName = sanitizedFileName;
    // }
    let finalName = sanitizedFileName;

    if (!finalName) {
      const extension = fileName.split('.').pop();
      finalName = `file-upload${extension ? `.${extension}` : ''}`;
    }

    // 👉 FORCE EXTENSION LOWERCASE
    const parts = finalName.split('.');
    if (parts.length > 1) {
      const ext = parts.pop()?.toLowerCase();
      finalName = `${parts.join('.')}.${ext}`;
    }

    fileName = finalName;
    // --- END NEW ---

    // Determine file type
    let fileType: 'pdf' | 'image' | null = null;
    if (mimeType === 'application/pdf') {
      fileType = 'pdf';
    } else if (
      mimeType === 'image/jpeg' ||
      mimeType === 'image/png' ||
      mimeType === 'image/jpg' ||
      mimeType === 'image/heic' ||
      mimeType === 'image/svg+xml'
    ) {
      fileType = 'image';
    } else {
      Alert.alert('Only PDF or image files (JPG, PNG, SVG) are allowed');
      return null;
    }

    // Convert content:// to file:// on Android if needed
    if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
      try {
        const destPath = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;
        await RNFetchBlob.fs.cp(fileUri, destPath);
        fileUri = `file://${destPath}`;
      } catch (err) {
        console.warn('Failed to copy file to cache directory:', err);
      }
    }

    // Build FormData
    const formData = new FormData();
    formData.append('document', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    return { formData, fileType, fileName };
  } catch (error) {
    console.error('Document Picker Error:', error);
    Alert.alert('An error occurred while picking the document');
    return null;
  }
};

// for multiple documents selection
// export const handleGenericMultiDocumentPicker = async () => {
//   try {
//     const pickResults = await pick({
//       allowMultiSelection: true,
//       type: [
//         'application/pdf',
//         'image/jpeg',
//         'image/png',
//         'image/jpg',
//         'image/heic',
//       ],
//     });

//     if (!pickResults || pickResults.length === 0) {
//       throw new Error('No files picked');
//     }

//     const pickedFiles: any[] = [];

//     for (let pickResult of pickResults) {
//       if (!pickResult?.uri) continue;

//       let fileUri = pickResult.uri;
//       let mimeType = pickResult.type;
//       let fileName = pickResult.name || 'file';

//       // ------------------------
//       //  Sanitize Filename
//       // ------------------------
//       const sanitizedFileName = fileName
//         .replace(/\s+/g, '-')
//         .replace(/[^a-zA-Z0-9.\-_]/g, '')
//         .replace(/--+/g, '-')
//         .replace(/^-+|-+$/g, '');

//       fileName = sanitizedFileName || `file-${Date.now()}.pdf`;

//       // ------------------------
//       // Validate file type
//       // ------------------------
//       let fileType: 'pdf' | 'image' | null = null;

//       if (mimeType === 'application/pdf') fileType = 'pdf';
//       else if (
//         mimeType === 'image/jpeg' ||
//         mimeType === 'image/png' ||
//         mimeType === 'image/jpg' ||
//         mimeType === 'image/heic'
//       )
//         fileType = 'image';
//       else {
//         Alert.alert('Only PDF or image files (JPG, PNG ...) are allowed');
//         continue;
//       }

//       // -------------------------
//       // Android: Convert content:// to file://
//       // -------------------------
//       if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
//         try {
//           const destPath = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;
//           await RNFetchBlob.fs.cp(fileUri, destPath);
//           fileUri = `file://${destPath}`;
//         } catch (err) {
//           console.warn('Failed to convert content://', err);
//         }
//       }

//       // -------------------------
//       // Build FormData for upload
//       // -------------------------
//       const formData = new FormData();
//       formData.append('document', {
//         uri: fileUri,
//         name: fileName,
//         type: mimeType,
//       } as any);

//       pickedFiles.push({
//         formData,
//         fileType,
//         fileName,
//       });
//     }

//     return pickedFiles; // return ARRAY
//   } catch (error) {
//     console.error('Document Picker Error:', error);
//     Alert.alert('An error occurred while picking documents');
//     return null;
//   }
// };


export const handleGenericMultiDocumentPicker = async () => {
  try {
    const validTypes = [
      'application/pdf',
      'application/msword', // DOC
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/heic',
      'image/svg+xml',
    ];

    const pickResults = await pick({
      allowMultiSelection: true,

      // ❗ iOS does NOT support multi-select + type filter together
      type: Platform.OS === 'ios' ? undefined : validTypes,
    });

    if (!pickResults || pickResults.length === 0) {
      throw new Error('No files picked');
    }

    const pickedFiles: any[] = [];

    for (let pickResult of pickResults) {
      if (!pickResult?.uri) continue;

      let fileSize = pickResult.size;

      if (!fileSize && pickResult.uri) {
        try {
          const stats = await RNFetchBlob.fs.stat(pickResult.uri);
          fileSize = Number(stats.size);
        } catch (e) {
          console.warn('Could not get file size', e);
        }
      }

      if (fileSize && fileSize > MAX_SIZE_BYTES) {
        Alert.alert(`${pickResult.name} exceeds ${MAX_SIZE_MB} MB limit`);
        continue; // skip this file
      }

      let fileUri = pickResult.uri;
      let mimeType = pickResult.type;
      let fileName = pickResult.name || 'file';

      // ---------------------------------------
      //  iOS: MUST manually validate file type
      // ---------------------------------------
      if (Platform.OS === 'ios' && !validTypes.includes(mimeType ?? '')) {
        Alert.alert('Only PDF, DOC, DOCX or image files are allowed');
        continue;
      }

      // ---------------------------------------
      // Sanitize File Name
      // ---------------------------------------
      const sanitizedFileName = fileName
        .replace(/\s+/g, '-')      // spaces → hyphens
        .replace(/[^a-zA-Z0-9.\-_]/g, '') // remove bad chars
        .replace(/--+/g, '-')      // multiple hyphens → single
        .replace(/^-+|-+$/g, '');  // trim hyphens

      // fileName = sanitizedFileName || `file-${Date.now()}.pdf`;
      let finalName = sanitizedFileName || `file-${Date.now()}`;

      // 👉 FORCE EXTENSION LOWERCASE
      const parts = finalName.split('.');
      if (parts.length > 1) {
        const ext = parts.pop()?.toLowerCase();
        finalName = `${parts.join('.')}.${ext}`;
      }

      fileName = finalName;

      // ---------------------------------------
      // Determine File Type
      // ---------------------------------------
      // let fileType: 'pdf' | 'image' | null = null;
      let fileType: 'pdf' | 'image' | 'doc' | null = null;


      if (mimeType === 'application/pdf') fileType = 'pdf';
      else if (mimeType?.startsWith('image/')) fileType = 'image';
      else if (
        mimeType === 'application/msword' ||
        mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        fileType = 'doc';
      }
      else {
        Alert.alert('Only PDF or image files are allowed');
        continue;
      }

      // ---------------------------------------
      // Android: Convert content:// → file://
      // ---------------------------------------
      if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
        try {
          const destPath = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;
          await RNFetchBlob.fs.cp(fileUri, destPath);
          fileUri = `file://${destPath}`;
        } catch (err) {
          console.warn('Failed to convert content://', err);
        }
      }

      // ---------------------------------------
      // Build FormData
      // ---------------------------------------

      const formData = new FormData();
      formData.append('document', {
        uri: fileUri,
        name: fileName,
        type: mimeType,
      } as any);
      console.log(JSON.stringify(formData), 'formdatatat----')

      pickedFiles.push({
        formData,
        fileType,
        fileName,
      });
    }

    return pickedFiles;
  } catch (error) {
    console.error('Document Picker Error:', error);
    Alert.alert('An error occurred while picking documents');
    return null;
  }
};


export const getFileTypeFromUrl = (url: string): 'pdf' | 'image' | null => {
  if (!url || typeof url !== 'string') return null;

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.endsWith('.pdf')) {
    return 'pdf';
  } else if (
    lowerUrl.endsWith('.jpg') ||
    lowerUrl.endsWith('.jpeg') ||
    lowerUrl.endsWith('.png') ||
    lowerUrl.endsWith('.heic') ||
    lowerUrl.endsWith('.heif') ||
    lowerUrl.endsWith('.svg')
  ) {
    return 'image';
  }

  // Optional: Try MIME type if available in URL query (e.g., ?type=image/png)
  const mimeMatch = lowerUrl.match(/type=(.*?)(?=&|$)/);
  const mime = mimeMatch?.[1];

  if (mime?.includes('pdf')) return 'pdf';
  if (mime?.includes('image')) return 'image';

  return null;
};


// import {Platform, Alert} from 'react-native';
// import {pick} from '@react-native-documents/picker';
// import RNFetchBlob from 'react-native-blob-util';

// export const handleGenericDocumentPicker = async () => {
//   try {
//     const [pickResult] = await pick();

//     if (!pickResult?.uri) {
//       throw new Error('No file picked');
//     }

//     let fileUri = pickResult.uri;
//     let mimeType = pickResult.type;
//     let fileName = pickResult.name || 'file';

//     // --- NEW: Sanitize the filename to remove spaces and problematic characters ---
//     // 1. Replace spaces with hyphens
//     // 2. Remove any characters that are not alphanumeric, hyphen, underscore, or a dot (for extension)
//     // 3. Ensure multiple hyphens don't appear consecutively
//     // 4. Handle leading/trailing hyphens (optional but good practice)
//     const sanitizedFileName = fileName
//       .replace(/\s+/g, '-') // Replace one or more spaces with a single hyphen
//       .replace(/[^a-zA-Z0-9.\-_]/g, '') // Remove all non-alphanumeric, non-hyphen, non-underscore, non-dot characters
//       .replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
//       .replace(/^-+|-+$/g, ''); // Remove leading or trailing hyphens

//     // If sanitization results in an empty string, provide a fallback
//     if (!sanitizedFileName) {
//       const extension = fileName.split('.').pop();
//       fileName = `file-upload${extension ? `.${extension}` : ''}`;
//     } else {
//       fileName = sanitizedFileName;
//     }
//     // --- END NEW ---

//     // Determine file type
//     let fileType: 'pdf' | 'image' | null = null;
//     if (mimeType === 'application/pdf') {
//       fileType = 'pdf';
//     } else if (
//       mimeType === 'image/jpeg' ||
//       mimeType === 'image/png' ||
//       mimeType === 'image/jpg' ||
//       mimeType === 'image/heic'
//     ) {
//       fileType = 'image';
//     } else {
//       Alert.alert('Only PDF or image files (JPG, PNG) are allowed');
//       return null;
//     }

//     // Convert content:// to file:// on Android if needed
//     if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
//       try {
//         const destPath = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;
//         await RNFetchBlob.fs.cp(fileUri, destPath);
//         fileUri = `file://${destPath}`;
//       } catch (err) {
//         console.warn('Failed to copy file to cache directory:', err);
//       }
//     }

//     // Build FormData
//     const formData = new FormData();
//     formData.append('document', {
//       uri: fileUri,
//       name: fileName,
//       type: mimeType,
//     } as any);

//     return {formData, fileType, fileName};
//   } catch (error) {
//     console.error('Document Picker Error:', error);
//     Alert.alert('An error occurred while picking the document');
//     return null;
//   }
// };

// // for multiple documents selection
// // export const handleGenericMultiDocumentPicker = async () => {
// //   try {
// //     const pickResults = await pick({
// //       allowMultiSelection: true,
// //       type: [
// //         'application/pdf',
// //         'image/jpeg',
// //         'image/png',
// //         'image/jpg',
// //         'image/heic',
// //       ],
// //     });

// //     if (!pickResults || pickResults.length === 0) {
// //       throw new Error('No files picked');
// //     }

// //     const pickedFiles: any[] = [];

// //     for (let pickResult of pickResults) {
// //       if (!pickResult?.uri) continue;

// //       let fileUri = pickResult.uri;
// //       let mimeType = pickResult.type;
// //       let fileName = pickResult.name || 'file';

// //       // ------------------------
// //       //  Sanitize Filename
// //       // ------------------------
// //       const sanitizedFileName = fileName
// //         .replace(/\s+/g, '-')
// //         .replace(/[^a-zA-Z0-9.\-_]/g, '')
// //         .replace(/--+/g, '-')
// //         .replace(/^-+|-+$/g, '');

// //       fileName = sanitizedFileName || `file-${Date.now()}.pdf`;

// //       // ------------------------
// //       // Validate file type
// //       // ------------------------
// //       let fileType: 'pdf' | 'image' | null = null;

// //       if (mimeType === 'application/pdf') fileType = 'pdf';
// //       else if (
// //         mimeType === 'image/jpeg' ||
// //         mimeType === 'image/png' ||
// //         mimeType === 'image/jpg' ||
// //         mimeType === 'image/heic'
// //       )
// //         fileType = 'image';
// //       else {
// //         Alert.alert('Only PDF or image files (JPG, PNG ...) are allowed');
// //         continue;
// //       }

// //       // -------------------------
// //       // Android: Convert content:// to file://
// //       // -------------------------
// //       if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
// //         try {
// //           const destPath = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;
// //           await RNFetchBlob.fs.cp(fileUri, destPath);
// //           fileUri = `file://${destPath}`;
// //         } catch (err) {
// //           console.warn('Failed to convert content://', err);
// //         }
// //       }

// //       // -------------------------
// //       // Build FormData for upload
// //       // -------------------------
// //       const formData = new FormData();
// //       formData.append('document', {
// //         uri: fileUri,
// //         name: fileName,
// //         type: mimeType,
// //       } as any);

// //       pickedFiles.push({
// //         formData,
// //         fileType,
// //         fileName,
// //       });
// //     }

// //     return pickedFiles; // return ARRAY
// //   } catch (error) {
// //     console.error('Document Picker Error:', error);
// //     Alert.alert('An error occurred while picking documents');
// //     return null;
// //   }
// // };


// export const handleGenericMultiDocumentPicker = async () => {
//   try {
//     const validTypes = [
//       'application/pdf',
//       'application/msword', // DOC
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
//       'image/jpeg',
//       'image/png',
//       'image/jpg',
//       'image/heic',
//     ];

//     const pickResults = await pick({
//       allowMultiSelection: true,

//       // ❗ iOS does NOT support multi-select + type filter together
//       type: Platform.OS === 'ios' ? undefined : validTypes,
//     });

//     if (!pickResults || pickResults.length === 0) {
//       throw new Error('No files picked');
//     }

//     const pickedFiles: any[] = [];

//     for (let pickResult of pickResults) {
//       if (!pickResult?.uri) continue;

//       let fileUri = pickResult.uri;
//       let mimeType = pickResult.type;
//       let fileName = pickResult.name || 'file';

//       // ---------------------------------------
//       //  iOS: MUST manually validate file type
//       // ---------------------------------------
//       if (Platform.OS === 'ios' && !validTypes.includes(mimeType ?? '')) {
//         Alert.alert('Only PDF, DOC, DOCX or image files are allowed');
//         continue;
//       }

//       // ---------------------------------------
//       // Sanitize File Name
//       // ---------------------------------------
//       const sanitizedFileName = fileName
//         .replace(/\s+/g, '-')      // spaces → hyphens
//         .replace(/[^a-zA-Z0-9.\-_]/g, '') // remove bad chars
//         .replace(/--+/g, '-')      // multiple hyphens → single
//         .replace(/^-+|-+$/g, '');  // trim hyphens

//       fileName = sanitizedFileName || `file-${Date.now()}.pdf`;

//       // ---------------------------------------
//       // Determine File Type
//       // ---------------------------------------
//       // let fileType: 'pdf' | 'image' | null = null;
//       let fileType: 'pdf' | 'image' | 'doc' | null = null;


//       if (mimeType === 'application/pdf') fileType = 'pdf';
//       else if (mimeType?.startsWith('image/')) fileType = 'image';
//       else if (
//         mimeType === 'application/msword' ||
//         mimeType ===
//           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//       ) {
//         fileType = 'doc';
//       }
//       else {
//         Alert.alert('Only PDF or image files are allowed');
//         continue;
//       }

//       // ---------------------------------------
//       // Android: Convert content:// → file://
//       // ---------------------------------------
//       if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
//         try {
//           const destPath = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;
//           await RNFetchBlob.fs.cp(fileUri, destPath);
//           fileUri = `file://${destPath}`;
//         } catch (err) {
//           console.warn('Failed to convert content://', err);
//         }
//       }

//       // ---------------------------------------
//       // Build FormData
//       // ---------------------------------------
//       const formData = new FormData();
//       formData.append('document', {
//         uri: fileUri,
//         name: fileName,
//         type: mimeType,
//       } as any);

//       pickedFiles.push({
//         formData,
//         fileType,
//         fileName,
//       });
//     }

//     return pickedFiles;
//   } catch (error) {
//     console.error('Document Picker Error:', error);
//     Alert.alert('An error occurred while picking documents');
//     return null;
//   }
// };


// export const getFileTypeFromUrl = (url: string): 'pdf' | 'image' | null => {
//   if (!url || typeof url !== 'string') return null;

//   const lowerUrl = url.toLowerCase();

//   if (lowerUrl.endsWith('.pdf')) {
//     return 'pdf';
//   } else if (
//     lowerUrl.endsWith('.jpg') ||
//     lowerUrl.endsWith('.jpeg') ||
//     lowerUrl.endsWith('.png') ||
//     lowerUrl.endsWith('.heic') ||
//     lowerUrl.endsWith('.heif')
//   ) {
//     return 'image';
//   }

//   // Optional: Try MIME type if available in URL query (e.g., ?type=image/png)
//   const mimeMatch = lowerUrl.match(/type=(.*?)(?=&|$)/);
//   const mime = mimeMatch?.[1];

//   if (mime?.includes('pdf')) return 'pdf';
//   if (mime?.includes('image')) return 'image';

//   return null;
// };
