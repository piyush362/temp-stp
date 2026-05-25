import ReactNativeBlobUtil from 'react-native-blob-util';

export interface ScannedImage {
  uri: string;
  width: number;
  height: number;
}

// Optimized Base64 decoder for converting JPEG base64 to binary byte array in pure JS
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const lookup = new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}

function decodeBase64(base64: string): Uint8Array {
  const cleanedBase64 = base64.replace(/\s/g, '');
  let bufferLength = cleanedBase64.length * 0.75;
  if (cleanedBase64[cleanedBase64.length - 1] === '=') {
    bufferLength--;
    if (cleanedBase64[cleanedBase64.length - 2] === '=') {
      bufferLength--;
    }
  }

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < cleanedBase64.length; i += 4) {
    const encoded1 = lookup[cleanedBase64.charCodeAt(i)];
    const encoded2 = lookup[cleanedBase64.charCodeAt(i + 1)];
    const encoded3 = lookup[cleanedBase64.charCodeAt(i + 2)];
    const encoded4 = lookup[cleanedBase64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }
  return bytes;
}

// Convert a standard ASCII string to a Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i) & 0xff;
  }
  return arr;
}

// Encode final compiled PDF bytes back to Base64 so react-native-blob-util can write it
function encodeBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : NaN;
    const b3 = i + 2 < len ? bytes[i + 2] : NaN;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4);
    const enc3 = isNaN(b2) ? 64 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6);
    const enc4 = isNaN(b3) ? 64 : b3 & 63;

    result += chars[enc1] + chars[enc2] + (enc3 === 64 ? '=' : chars[enc3]) + (enc4 === 64 ? '=' : chars[enc4]);
  }
  return result;
}

const getCleanPath = (uri: string): string => {
  let path = uri;
  if (path.startsWith('file://')) {
    path = path.replace('file://', '');
  }
  return decodeURIComponent(path);
};

/**
 * Compiles a list of local scanned JPEG images into a single standard PDF file.
 * Saves the resulting PDF to a persistent local path and returns the path.
 */
export async function generatePdfFromImages(
  images: ScannedImage[],
  outputFileName: string
): Promise<string> {
  if (!images || images.length === 0) {
    throw new Error('No images provided for PDF generation');
  }

  const objects: Uint8Array[] = [];
  
  // Object 1: Catalog
  const obj1 = stringToUint8Array("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push(obj1);
  
  // Object 2: Pages Parent
  const kids: string[] = [];
  for (let i = 0; i < images.length; i++) {
    kids.push(`${3 * i + 3} 0 R`);
  }
  const obj2 = stringToUint8Array(`2 0 obj\n<< /Type /Pages /Count ${images.length} /Kids [${kids.join(' ')}] >>\nendobj\n`);
  objects.push(obj2);

  // Compile each page
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const pageObjNum = 3 * i + 3;
    const contentObjNum = 3 * i + 4;
    const imageObjNum = 3 * i + 5;
    
    // Read the image file as base64
    const cleanPath = getCleanPath(img.uri);
    const base64Data = await ReactNativeBlobUtil.fs.readFile(cleanPath, 'base64');
    const imgBytes = decodeBase64(base64Data);

    // Page dimensions
    const width = img.width > 0 ? img.width : 595; // default to A4 scale if unknown
    const height = img.height > 0 ? img.height : 842;
    
    // Page Object
    const pageText = `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents ${contentObjNum} 0 R /Resources << /XObject << /Im${i} ${imageObjNum} 0 R >> >> >>\nendobj\n`;
    const pageBytes = stringToUint8Array(pageText);
    
    // Content Stream (Draws the image scaled to exactly match page dimensions)
    const contentStream = `q\n${width} 0 0 ${height} 0 0 cm\n/Im${i} Do\nQ\n`;
    const contentText = `${contentObjNum} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`;
    const contentBytes = stringToUint8Array(contentText);
    
    // Image Object wrapping the binary JPEG data
    const headerText = `${imageObjNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\nstream\n`;
    const headerBytes = stringToUint8Array(headerText);
    const footerBytes = stringToUint8Array(`\nendstream\nendobj\n`);
    
    const imageObjectBytes = new Uint8Array(headerBytes.length + imgBytes.length + footerBytes.length);
    imageObjectBytes.set(headerBytes, 0);
    imageObjectBytes.set(imgBytes, headerBytes.length);
    imageObjectBytes.set(footerBytes, headerBytes.length + imgBytes.length);
    
    objects.push(pageBytes);      // pageObjNum
    objects.push(contentBytes);   // contentObjNum
    objects.push(imageObjectBytes); // imageObjNum
  }

  // Header
  const header = stringToUint8Array("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  
  // Calculate running byte offsets for every object
  const offsets: number[] = [];
  let currentOffset = header.length;
  for (let i = 0; i < objects.length; i++) {
    offsets.push(currentOffset);
    currentOffset += objects[i].length;
  }
  
  // xref and trailer
  let xrefText = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    xrefText += `${offStr} 00000 n \n`;
  }
  
  const startXrefOffset = currentOffset;
  const trailerText = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXrefOffset}\n%%EOF\n`;
  
  const xrefBytes = stringToUint8Array(xrefText + trailerText);
  
  // Concatenate all parts
  let totalLength = header.length + xrefBytes.length;
  for (let i = 0; i < objects.length; i++) {
    totalLength += objects[i].length;
  }
  
  const finalPdfBytes = new Uint8Array(totalLength);
  let pos = 0;
  finalPdfBytes.set(header, pos);
  pos += header.length;
  for (let i = 0; i < objects.length; i++) {
    finalPdfBytes.set(objects[i], pos);
    pos += objects[i].length;
  }
  finalPdfBytes.set(xrefBytes, pos);
  
  // Encode to base64
  const pdfBase64 = encodeBase64(finalPdfBytes);
  
  // Write the file locally
  const outputPath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${outputFileName}`;
  await ReactNativeBlobUtil.fs.writeFile(outputPath, pdfBase64, 'base64');
  
  return outputPath;
}
