import {
  useState,
  useRef,
  useEffect,
} from 'react';

import { ExerciseTable } from './components/exercise-table';
import { startAndUpdateTimer } from './funcs/start-and-update-timer';
import { ALARM_SOUND_FILEPATH, EXERCISES_BREAK_TIME, MOBILE_MODE, REPEATS_BREAK_TIME } from './const';
import { Exercise } from './types';
import './App.css';
import { loadAndParseReportFromFile, saveReportToFile } from './reports/files-api';
import { getExercisesFromInputString } from './funcs/parse-input';
import { STORAGE_TRAINING_EMBEDS_KEY, STORAGE_TRAINING_EXERCISES_TEXT_LIST, STORAGE_TRAINING_REPORT_KEY, STORAGE_TRAINING_START_KEY, getLSDataByKey, getLSTrainingState, saveLSDataByKey, saveLSTrainingState } from './local-storage/ls-class';
import { RationPdfViewer } from './components/ration-pdf-viewer';

const mockedText =
  'Бег на месте 5х30 сек\n\
Выпады назад 4х12 (с паузой внизу)\n\
Ягодичный мост 4х15(пауза наверху и напрягать ягодицы)\n\
Отжимания с ног 5х5 (пауза внизу)\n\
Лодочка 3х15\n\
Планка боковая 4х20 сек';

const App = () => {
  const [currentTab, setCurrentTab] = useState('training');
  const renderTab = () => {
    switch (currentTab) {
      case 'ration': return <RationPdfViewer />;
      case 'training': return <TrainingTab />;
      default:
        return <TrainingTab />;
    }
  }

  const setTrainingTab = () => {
    setCurrentTab('training');
  }

  const setRationTab = () => {
    setCurrentTab('ration');
  }

  return (
    <>
      {renderTab()}
      <button style={{ margin: '10px' }} onClick={setTrainingTab}>Training</button>
      <button onClick={setRationTab}>Ration</button>
    </>
  );
};

const TrainingTab = () => {
  const [trainText, setTrainText] = useState<string>(mockedText);
  const [exercisesData, setExercisesData] = useState<Exercise[]>(getExercisesFromInputString(mockedText));
  const [disableNext, setDisableNext] = useState(false);
  const [disableExerciseText, setDisableExerciseText] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [currentExerciseID, setCurrentExerciseID] = useState<string>('1');
  const [trainHasStarted, setTrainHasStarted] = useState<boolean>(false);
  const [startTrainingDate, setStartTrainingDate] = useState<Date>();
  const [previousRepeatEndTime, setPreviousRepeatEndTime] = useState<Date>();
  const [previousTraining, setPreviousTraining] = useState<any>({});
  const alarmSoundRef = useRef<HTMLAudioElement>(null);
  const [lastClickTimeOnNext, setLastClickTimeOnNext] = useState<Date>();
  const exerciseTextTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTrainingInput, setShowTrainingInput] = useState(true);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [embedList, setEmbedList] = useState<String[]>([]);

  useEffect(() => {
    const loadAndSetReportFromFile = async () => {
      const { data, error } = await loadAndParseReportFromFile();
      if (data && !error) {
        const { exercisesList, startDate, endDate } = data;
        setPreviousTraining({
          exercisesList,
          exerciseDate: endDate,
          startTime: startDate,
          endTime: endDate
        });
        return;
      }
    };

    if (MOBILE_MODE === true) {
      // TODO: load the state of training from local storage if it exists
      const trainingState = getLSTrainingState();
      if (trainingState) {
        const parsedTrainingState = JSON.parse(trainingState);
        setExercisesData(parsedTrainingState);
        setTrainHasStarted(true);
        // get last startArray that is not empty
        let currentExerciseIDFromLS = '';
        // if training was just started
        if (parsedTrainingState.length > 0 && parsedTrainingState[0].startArray.length === 0) {
          currentExerciseIDFromLS = parsedTrainingState[0].id;
        }
        // if at least one repeat is done
        if (parsedTrainingState.length > 0 && parsedTrainingState[0].startArray.length > 0) {
          (parsedTrainingState as Exercise[]).forEach((ex: Exercise, exIndex: number) => {
            if (ex.startArray.length === 0 && currentExerciseIDFromLS === '' && exIndex > 0) {
              currentExerciseIDFromLS = parsedTrainingState[exIndex - 1].id;
            }
            //  else if (ex.startArray.length === Number(ex.times) && exIndex < parsedTrainingState.length - 1) {
            //   currentExerciseIDFromLS = parsedTrainingState[exIndex ].id;
            // }
          });
        }
        if (currentExerciseIDFromLS) {
          setCurrentExerciseID(currentExerciseIDFromLS);
        }
      }
      const embeds = getLSDataByKey(STORAGE_TRAINING_EMBEDS_KEY);
      const exerciseTextTextareaValue = getLSDataByKey(STORAGE_TRAINING_EXERCISES_TEXT_LIST);
      if (exerciseTextTextareaValue) {
        if (exerciseTextTextareaRef.current) {
          exerciseTextTextareaRef.current.value = exerciseTextTextareaValue;
        } else {
          console.info('Cannot find textarea with exercises list!');
        }
      }
      if (embeds) setEmbedList(JSON.parse(embeds));
      return;
    }
    loadAndSetReportFromFile();
  },[]);

  const onClickDebug = () => {
    setShowDebugPanel(!showDebugPanel);
  }

  const onTextChange = (e: { target: { value: string } }) => {
    const times = getExercisesFromInputString(e.target.value);
    setExercisesData(times);
    setTrainText(e.target.value)
  };

  const onClickNext = () => {
    const currentTime = new Date();
    setLastClickTimeOnNext(currentTime);

    if (!trainHasStarted) {
      onClickStart();
      return;
    }

    const startRepeatTime = new Date();
    if (!disableExerciseText) {
      setDisableExerciseText(true);
    }

    // 1. Находим первое упражнение где прогресс меньше общего числа подходов
    const exerciseInProgress = exercisesData.find(
      (exercise: Exercise) => Number(exercise.times) > exercise.progress
    );

    // 2. Для найденного упражнения
    if (exerciseInProgress) {
      // 3. Увеличиваем число выполненных подходов
      const updatedExerciseData = exercisesData.map(exercise => {
        if (exerciseInProgress.id === exercise.id) {
          return {
            ...exercise,
            progress: exercise.progress + 1,
            startArray: exercise.startArray.concat([startRepeatTime]),
          };
        }
        return exercise;
      });

      let breakDelay: number = REPEATS_BREAK_TIME;
      // 4. Если число выполненных подходов равно общему числу подходов
      if (
        Number(exerciseInProgress.times) - 1 === exerciseInProgress.progress
      ) {
        const currentExerciseIndex = exercisesData.findIndex(({ id }) => id === currentExerciseID);
        // 5. Устанавливаем интервал для перерыва между упражнениями
        breakDelay = EXERCISES_BREAK_TIME;
        if (currentExerciseIndex === exercisesData.length - 1) {
          // 6. Если текущий номер упражнения больше чем общее количество упражнений,
          // то текущий номер будет равен первому упражнению
          setCurrentExerciseID(exercisesData[0].id);
        } else {
          // 7. Иначе текущий номер увеличиваем на 1
          setCurrentExerciseID(exercisesData[currentExerciseIndex + 1].id);
        }
      }

      setDisableNext(true);
      setExercisesData(updatedExerciseData);

      if (MOBILE_MODE === true) {
        // TODO: write the state of training to local storage
        setDisableNext(false);
        // console.log({ updatedExerciseData });
        // console.log(JSON.stringify(updatedExerciseData));
        const trainingState = JSON.stringify(updatedExerciseData);
        saveLSTrainingState(trainingState);
        return;
      }

      startAndUpdateTimer(breakDelay, setSeconds, () => {
        setDisableNext(false);
        alarmSoundRef.current?.play();
      });
    }
  };

  const onClickStart = () => {
    const startDate = new Date();
    setTrainHasStarted(true);
    setStartTrainingDate(startDate);
    // Время завершения предыдущего повторения равно времени начала тренировки
    setPreviousRepeatEndTime(startDate);
    setCurrentExerciseID(exercisesData[0].id);
    // TODO: save training time to local storage
    saveLSDataByKey(STORAGE_TRAINING_START_KEY, new Date(startDate).toLocaleTimeString('ru-RU'));
    saveLSTrainingState(JSON.stringify(exercisesData));
    saveLSDataByKey(
      STORAGE_TRAINING_EXERCISES_TEXT_LIST,
      exerciseTextTextareaRef.current ? exerciseTextTextareaRef.current.value : ''
    );
    setShowTrainingInput(false);
  }

  const onClickEndAndSave = async () => {
    const endDate = new Date();
    const trainDuration = 0; // TODO: endDate - startDate;
    const trainReport = {
      trainText,
      startDate: startTrainingDate,
      endDate,
      trainDuration,
      lastCompletedExercise: '',
      exercisesData
    };
    console.log(trainReport);
    console.log(JSON.stringify(trainReport));

    if (MOBILE_MODE === true) {
      // TODO: save report to local storage
      saveLSDataByKey(STORAGE_TRAINING_REPORT_KEY, JSON.stringify(trainReport));
      return;
    }
    const statusText = await saveReportToFile(trainReport);
    console.log(statusText); // parses JSON response into native JavaScript objects
  }

  const onClickShowPreviousTraining = async () => {

  }

  const nextButtonClass = seconds > 0 ? 'active blink-bg' : '';


  return (
    <div>
      <div className="app-container">
        {document.documentElement.clientHeight}
        {' x '}
        {document.documentElement.clientWidth}
        <div className="timers-container">
          <div>
            <button
              style={{
                height: '150px',
                width: '100px'
              }}
              onClick={onClickNext}
              disabled={disableNext}
              className={`${nextButtonClass} training-control-button`}>
                {trainHasStarted ? 'NEXT' : 'START'}
            </button>
          </div>

          <div>
            <button 
              className="training-control-button"
              onClick={onClickEndAndSave}>
              END AND SAVE
            </button>
          </div>
        </div>

        <div>
          Previous click on NEXT button: <strong><i>{lastClickTimeOnNext?.toLocaleTimeString('ru-RU')}</i></strong>
        </div>

        <div className="text-and-table-container">
          <textarea
            ref={exerciseTextTextareaRef}
            className={showTrainingInput ? 'exercise-text' : 'exercise-text-hidden'}
            id=""
            rows={10}
            defaultValue={mockedText}
            onChange={onTextChange}></textarea>
        
          <ExerciseTable
            exercises={exercisesData}
            currentExerciseID={currentExerciseID}
            trainHasStarted={trainHasStarted}
          />
        </div>

        <br />
        <audio id="alarm-sound" ref={alarmSoundRef}>
          <source src={ALARM_SOUND_FILEPATH} type="audio/mpeg"></source>
          Your browser does not support the audio element.
        </audio>
      </div>

      <button onClick={onClickDebug}>debug</button>
      <div style={{ display: showDebugPanel ? 'block' : 'none' }}>
        <DebugBlock embedList={embedList} setEmbedList={setEmbedList} />
      </div>

    </div>
  );
};

type DebugBlockProps = {
  embedList: String[],
  setEmbedList: Function,
}

function DebugBlock({ embedList, setEmbedList }: DebugBlockProps) {
  const [embedText, setEmbedText] = useState<String>('');
  const localStorageRef = useRef<HTMLTextAreaElement>(null);
  const localStorageReportRef = useRef<HTMLTextAreaElement>(null);
  const embedTextRef = useRef<HTMLTextAreaElement>(null);

  const onClickShowLS = () => {
    const trainingState = getLSTrainingState();
    const div = localStorageRef?.current;
    if (div) div.innerHTML = `${trainingState}`;
  }

  const onClickShowReportLS = () => {
    const reportLS = getLSDataByKey(STORAGE_TRAINING_REPORT_KEY);
    const textAreaReport = localStorageReportRef?.current;
    if (textAreaReport) textAreaReport.innerHTML = `${reportLS}`;
  }

  const onClickAddEmbed = () => {
    const updatedEmbedList = [ ...embedList, embedText ];
    setEmbedList(updatedEmbedList);
    saveLSDataByKey(STORAGE_TRAINING_EMBEDS_KEY, JSON.stringify(updatedEmbedList));
  }

  const onClickClearEmbedText = () => {
    setEmbedText('');
    if (embedTextRef?.current) embedTextRef.current.value = '';
  }

  const onClickClearEmbed = () => {
    setEmbedList([]);
    saveLSDataByKey(STORAGE_TRAINING_EMBEDS_KEY, JSON.stringify([]));
  }

  const onTextEmbedChange = (e: { target: { value: string } }) => {
    setEmbedText(e.target.value);
  }

  const onClickClearLSTrainingState = () => {
    saveLSTrainingState('');
    saveLSDataByKey(STORAGE_TRAINING_EXERCISES_TEXT_LIST, '');
  }

  return (<>
      <br />
    <br />

    <div>
      {embedList.map(embed => <div dangerouslySetInnerHTML={{__html: embed}} />)}
    </div>
    
    <br />
    <br />

    <button onClick={onClickAddEmbed}>Add youtube embed</button>
    <button onClick={onClickClearEmbedText} style={{ marginLeft: '10px' }}>Clear embed textarea</button>
    <br/>
    <br />
    <button onClick={onClickClearEmbed}>Clear all</button>
    <br/>
    <br />
    <textarea
      className="textarea-debug"
      rows={5}
      onChange={onTextEmbedChange}
      ref={embedTextRef}
    >
    </textarea>

    <br />
    <br />
    <br />

    <button onClick={onClickShowLS}>Get local storage contents</button>
    
    <br />
    <br />
    <br />
      <textarea
        className="textarea-debug"
        ref={localStorageRef}
        rows={10}
      >
      </textarea>

      <br />
      <br />
      <br />

      <button onClick={onClickShowReportLS}>Get report from local storage</button>
      
      <br />
      <br />
      <br />
      <textarea
        className="textarea-debug"
        ref={localStorageReportRef}
        rows={10}
      >
      </textarea>

      <br />
      <br />
      <br />

      <button onClick={onClickClearLSTrainingState}>Clear training state from local storage</button>
  </>);
}

export default App;