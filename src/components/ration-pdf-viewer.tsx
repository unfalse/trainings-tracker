import { Document, Page } from 'react-pdf';

// 29.12.2023
const FIRST_DAY_OF_RATION = new Date(2023, 11, 29);
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

const getCurrentPageInRation = (): number => {
  const Difference_In_Time = TODAY.getTime() - FIRST_DAY_OF_RATION.getTime();
  const Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
  const currentWeek: number = Math.ceil(Difference_In_Days / 7);
  const pageInRation = WEEKS_TO_FIRST_PAGES_MAPPING[currentWeek] + (Difference_In_Days - 1) % 7;
  return pageInRation;
};

export const RationPdfViewer = () => {
  console.log(FIRST_DAY_OF_RATION.toString());
  console.log(LAST_DAY_OF_RATION.toString());
  console.log(TODAY.toString());
  console.log(TODAY > LAST_DAY_OF_RATION);
  if (TODAY > LAST_DAY_OF_RATION) {
    return (
      <div>The ration is over! Nothing to display.</div>
    );
  }

  const currentPage = getCurrentPageInRation();

  return (
    <Document file="myration.pdf">
      <Page pageNumber={currentPage} scale={1.5} renderTextLayer={false} renderAnnotationLayer={false}></Page>
    </Document>
  );
};