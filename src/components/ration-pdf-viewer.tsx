import { useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';

const RECEIPTS_PAGE_START = 58;
const RECEIPTS_PAGE_END = 77;

const FIRST_DAY_OF_RATION = new Date(2023, 11, 29, 9, 0, 0);
const TODAY = new Date();
let LAST_DAY_OF_RATION = new Date();

LAST_DAY_OF_RATION.setDate(FIRST_DAY_OF_RATION.getDate() + 27);

type WeeksToPages = { [index: number]: number };

const WEEKS_TO_FIRST_PAGES_MAPPING: WeeksToPages = {
  1: 16,
  2: 27,
  3: 38,
  4: 49,
};

const LOCAL_STORAGE_FILE = 'pdf-BASE64';

const getCurrentPageInRation = (today: Date, firstDay: Date, weeksMapping: WeeksToPages): number => {
  const Difference_In_Time = today.getTime() - firstDay.getTime();
  const Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
  const currentWeek: number = Math.ceil(Difference_In_Days / 7);
  const pageInRation = weeksMapping[currentWeek] + Difference_In_Days % 7;

  return pageInRation;
};

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve,reject) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      resolve(reader.result)
    };
    reader.onerror = reject
  });
};

// console.log({
//   Difference_In_Days,
//   currentWeek,
//   pageInRation,
// });
// console.log({ TODAY, FIRST_DAY_OF_RATION });

export const RationPdfViewer = () => {
  const [currentReceiptPage, setCurrentReceiptPage] = useState(RECEIPTS_PAGE_START);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fileFromLocalStorage = localStorage.getItem(LOCAL_STORAGE_FILE);
    if (fileFromLocalStorage) {
      setPdfBase64(fileFromLocalStorage);
    }
  }, []);

  if (TODAY > LAST_DAY_OF_RATION) {
    return (
      <div>The ration is over! Nothing to display.</div>
    );
  }

  const currentPage = getCurrentPageInRation(TODAY, FIRST_DAY_OF_RATION, WEEKS_TO_FIRST_PAGES_MAPPING);

  const nextReceiptPage = () => {
    if (currentReceiptPage + 1 <= RECEIPTS_PAGE_END) {
      setCurrentReceiptPage(currentReceiptPage + 1);
    }
  }

  const previousReceiptPage = () => {
    if (currentReceiptPage - 1 >= RECEIPTS_PAGE_START) {
      setCurrentReceiptPage(currentReceiptPage - 1);
    }
  }

  const onChange = async () => {
    let fileObj;
    if (fileInput.current && fileInput.current.files) {
      fileObj = fileInput.current.files[0];
    } else {
      return;
    }
    const data: string = await getBase64(fileObj) as string;
    localStorage.setItem(LOCAL_STORAGE_FILE, data);
    setPdfBase64(data);
  }

  return (
    <>
      <Document file={pdfBase64}>
        <Page pageNumber={currentPage} scale={1.5} renderTextLayer={false} renderAnnotationLayer={false}></Page>
      </Document>
      <br />
      <button onClick={previousReceiptPage} style={{ margin: '10px' }}>Previous</button>
      <button onClick={nextReceiptPage} style={{ margin: '10px' }}>Next</button>
      <br />
      <Document file={pdfBase64}>
        <Page pageNumber={currentReceiptPage} scale={1.5} renderTextLayer={false} renderAnnotationLayer={false}></Page>
      </Document>
      <label htmlFor="avatar">Choose a profile picture:</label>
      <input type="file" id="avatar" name="avatar" accept=".pdf" onChange={onChange} ref={fileInput} />
    </>
  );
};