import { useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';

const RECEIPTS_PAGE_START = 58;
const RECEIPTS_PAGE_END = 77;

const FIRST_DAY_OF_RATION = new Date(2024, 1, 2, 9, 0, 0);
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
  const [currentRationPageOffset, setCurrentRationtPageOffset] = useState(0);
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

  const previousRationPageClick = () => {
    if (currentPage - currentRationPageOffset - 1 > 0) {
      setCurrentRationtPageOffset(currentRationPageOffset - 1);
    }
  }

  const nextRationPageClick = () => {
    setCurrentRationtPageOffset(currentRationPageOffset + 1);
  }

  const previousReceiptPage = () => {
    if (currentReceiptPage - 1 >= RECEIPTS_PAGE_START) {
      setCurrentReceiptPage(currentReceiptPage - 1);
    }
  }

  const returnToRationPageClick = () => {
    setCurrentRationtPageOffset(0);
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
      <br />
      <button onClick={previousRationPageClick} style={{ margin: '10px' }}>Previous</button>
      <button onClick={nextRationPageClick} style={{ margin: '10px' }}>Next</button>
      <button onClick={returnToRationPageClick} style={{ margin: '10px' }}>Return</button>
      <br />

      <div>Ration start date: <strong><i>{FIRST_DAY_OF_RATION.toLocaleDateString('ru-RU', { dateStyle: 'medium' })}</i></strong></div>

      <div style={{ height: '900px' }}>
        <Document file={pdfBase64}>
          <Page pageNumber={currentPage + currentRationPageOffset} scale={1.5} renderTextLayer={false} renderAnnotationLayer={false}></Page>
        </Document>
      </div>

      <br />
      <button onClick={previousReceiptPage} style={{ margin: '10px' }}>Previous</button>
      <button onClick={nextReceiptPage} style={{ margin: '10px' }}>Next</button>
      <br />

      <div style={{ height: '900px' }}>
        <Document file={pdfBase64}>
          <Page pageNumber={currentReceiptPage} scale={1.5} renderTextLayer={false} renderAnnotationLayer={false}></Page>
        </Document>
      </div>

      <label htmlFor="ration">Choose a pdf with ration:</label>
      <input type="file" id="ration" accept=".pdf" onChange={onChange} ref={fileInput} />
      <br/>
    </>
  );
};