// import PdfPageImage from 'react-native-pdf-page-image';
import { PrintPriceV2 } from '../redux/slices/auth.slice';

export const downloadAndConvertPdfToImages = async (
  pdfUrl: string,
): Promise<{ uri: string; width: number; height: number } | null> => {
  const scale = 1.0;
  try {
    // const images = await PdfPageImage.generateAllPages(pdfUrl, scale);
    const images: any = [];
    // images.forEach((image, index) =>
    //   console.log(
    //     `Page ${index + 1}: ${image.uri}, Width: ${image.width}, Height: ${image.height}`
    //   )
    // );

    // Return the first page image or null if no pages
    return images.length > 0 ? images[0] : null;
  } catch (error) {
    console.error('Error generating images:', error);
    return null;
  }
};

export const downloadAndConvertPdfToImagesV3 = async (
  pdfUrl: string,
): Promise<{
  imageFile: { uri: string; width: number; height: number } | null;
  fileLength: number;
  allImages: { uri: string; width: number; height: number }[];
} | null> => {
  const scale = 1.0;
  try {
    // const images = await PdfPageImage.generateAllPages(pdfUrl, scale);
    const images: any = [];

    return {
      imageFile: images.length > 0 ? images[0] : null,
      fileLength: images.length,
      allImages: images,
    };
  } catch (error) {
    console.error('Error generating images:', error);
    return null;
  }
};

export const downloadAndConvertPdfToImagesV2 = async (
  pdfUrl: string,
): Promise<{ uri: string; width: number; height: number }[] | null> => {
  const scale = 1.0;
  try {
    // const images = await PdfPageImage.generateAllPages(pdfUrl, scale);
    const images: any = [];

    if (!images || images.length === 0) {
      return null;
    }

    // Optional: Log all pages
    // images.forEach((image, index) =>
    //   console.log(
    //     `Page ${index + 1}: ${image.uri}, Width: ${image.width}, Height: ${image.height}`
    //   )
    // );

    return images;
  } catch (error) {
    console.error('Error generating images:', error);
    return null;
  }
};

export const getPrintingCombination = ({
  printType,
  paperSize,
}: {
  printType: 'bw' | 'color';
  paperSize: 'a3' | 'a4';
}) => {
  if (printType === 'bw') {
    return paperSize === 'a3' ? 'a3_black_white' : 'a4_black_white';
  } else {
    return paperSize === 'a3' ? 'a3_colour' : 'a4_colour';
  }
};

export const calculatePrintPrice = ({
  printType,
  numberOfCopies,
  numberOfPages,
  printPrice,
}: {
  printType: 'bw' | 'color';
  numberOfCopies: number | string;
  numberOfPages: number | string;
  printPrice: {
    black_and_white: number;
    colored: number;
  };
}): number => {
  const pricePerPage =
    printType === 'bw'
      ? printPrice.black_and_white ?? 0
      : printPrice.colored ?? 0;

  const copies = Number(numberOfCopies);
  const pages = Number(numberOfPages);

  return pricePerPage * pages * copies;
};

export const calculatePrintPriceV2 = ({
  printCombinationPrice,
  numberOfCopies,
  numberOfPages,
}: {
  printCombinationPrice: PrintPriceV2 | null;
  numberOfCopies: number | string;
  numberOfPages: number | string;
}) => {
  if (!printCombinationPrice) return 0;

  const copies = Number(numberOfCopies);
  const pages = Number(numberOfPages);

  if (isNaN(copies) || isNaN(pages) || copies <= 0 || pages <= 0) return 0;

  return copies * pages * printCombinationPrice.print_price;
};
