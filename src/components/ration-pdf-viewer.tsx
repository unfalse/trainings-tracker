import { useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';
import Calendar from 'react-calendar';
import { LooseValue, Range } from 'react-calendar/dist/cjs/shared/types';

import 'react-calendar/dist/Calendar.css';

const RECEIPTS_PAGE_START = 58;
const FOUR_WEEKS_DAYS_COUNT = 27;

const TODAY = new Date();

type WeeksToPages = { [index: number]: number };

const WEEKS_TO_FIRST_PAGES_MAPPING: WeeksToPages = {
  1: 16,
  2: 27,
  3: 38,
  4: 49,
};

const LOCAL_STORAGE_FILE = 'pdf-BASE64';
const LOCAL_STORAGE_RATION_START_DATE = 'RATION-START-DATE';

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

export const RationPdfViewer = () => {
  const [currentReceiptPage, setCurrentReceiptPage] = useState(RECEIPTS_PAGE_START);
  const [currentRationPageOffset, setCurrentRationtPageOffset] = useState(0);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [rationStartDate, setRationStartDate] = useState<Date>(TODAY);
  
  const fileInput = useRef<HTMLInputElement>(null);
  let lastDayOfRation = new Date();
  lastDayOfRation.setDate(rationStartDate.getDate() + FOUR_WEEKS_DAYS_COUNT);

  useEffect(() => {
    const fileFromLocalStorage = localStorage.getItem(LOCAL_STORAGE_FILE);
    const rawRationStartDateFromLS = localStorage.getItem(LOCAL_STORAGE_RATION_START_DATE);
    const rationStartDateFromLocalStorage = rawRationStartDateFromLS !== null ? new Date(parseInt(rawRationStartDateFromLS || '', 10)) : '';
    if (fileFromLocalStorage) {
      setPdfBase64(fileFromLocalStorage);
    }
    if (rationStartDateFromLocalStorage !== '') {
      setRationStartDate(rationStartDateFromLocalStorage);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (TODAY > lastDayOfRation) {
    return (
      <div>The ration is over! Nothing to display.</div>
    );
  }

  const currentPage = getCurrentPageInRation(TODAY, rationStartDate, WEEKS_TO_FIRST_PAGES_MAPPING);

  const nextReceiptPage = () => {
    setCurrentReceiptPage(currentReceiptPage + 1);
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
    if (currentReceiptPage - 1 > 0) {
      setCurrentReceiptPage(currentReceiptPage - 1);
    }
  }

  const returnToRationPageClick = () => {
    setCurrentRationtPageOffset(0);
  }

  const returnToReceiptPageClick = () => {
    setCurrentReceiptPage(RECEIPTS_PAGE_START);
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

  const onSettingsClick = () => {
    setShowSettings(!showSettings);
  }

  const onStartDateChange = (e: { target: { value: string } }) => {
      const selectedDate = new Date(e.target.value);
    const chosenRationStartDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      9, 0, 0
    );
    setRationStartDate(chosenRationStartDate);
    localStorage.setItem(LOCAL_STORAGE_RATION_START_DATE, chosenRationStartDate.getTime().toString());
  }

  const rationDatesArray: LooseValue = rationStartDate !== TODAY ? [rationStartDate, TODAY] : TODAY;
  const rationStartDateLocaleString = rationStartDate.toLocaleDateString('en-CA')

  return (
    <>
      <div onClick={onSettingsClick} style={{ cursor: 'pointer',  userSelect: 'none' }}>
        {showSettings ? '-' : '+'}{' settings '}{showSettings ? '-' : '+'}
      </div>
      {showSettings && <div style={{ width: '600px' }}>
        <br/>
        Choose ration start date:&nbsp;
        <input type="date" onChange={onStartDateChange} defaultValue={rationStartDateLocaleString} />
        <br/><br/>
        <Calendar 
          value={rationDatesArray}
          className="calendar-fix"
          showNavigation
        />
        <br/>
        <br/>
        <label htmlFor="ration">Choose a pdf with ration:</label>
        <input type="file" id="ration" accept=".pdf" onChange={onChange} ref={fileInput} />
      </div>}
      
      
      <br />
      <button onClick={previousRationPageClick} style={{ margin: '10px' }}>Previous</button>
      <button onClick={nextRationPageClick} style={{ margin: '10px' }}>Next</button>
      <button onClick={returnToRationPageClick} style={{ margin: '10px' }}>Return</button>
      <br />

      <div>Ration start date: <strong><i>{rationStartDate.toLocaleDateString('ru-RU', { dateStyle: 'medium' })}</i></strong></div>

      <div style={{ height: '900px' }}>
        <Document file={pdfBase64}>
          <Page pageNumber={currentPage + currentRationPageOffset} scale={1.5} renderTextLayer={false} renderAnnotationLayer={false}></Page>
        </Document>
      </div>

      <br />
      <button onClick={previousReceiptPage} style={{ margin: '10px' }}>Previous</button>
      <button onClick={nextReceiptPage} style={{ margin: '10px' }}>Next</button>
      <button onClick={returnToRationPageClick} style={{ margin: '10px' }}>Return</button>
      <br />

      <div style={{ height: '900px' }}>
        <Document file={pdfBase64}>
          <Page pageNumber={currentReceiptPage} scale={1.5} renderTextLayer={false} renderAnnotationLayer={false}></Page>
        </Document>
      </div>
    </>
  );
};