import {
  useState,
  useRef,
  useEffect,
  Fragment
} from 'react';
import {v4} from 'uuid';

import { ExerciseTable } from './components/exercise-table';
import { CustomTimer } from './components/custom-timer';
import { startAndUpdateTimer } from './funcs/start-and-update-timer';
import { ALARM_SOUND_FILEPATH, EXERCISES_BREAK_TIME, REPEATS_BREAK_TIME } from './const';
import { Exercise } from './types';
import './App.css';
import { loadReportFromFile, saveReportToFile } from './reports/files-api';
import { getExercisesFromInputString } from './funcs/parse-input';

const mockedText =
  'Бег на месте 5х30 сек\n\
Выпады назад 4х12 (с паузой внизу)\n\
Ягодичный мост 4х15(пауза наверху и напрягать ягодицы)\n\
Отжимания с ног 5х5 (пауза внизу)\n\
Лодочка 3х15\n\
Планка боковая 4х20 сек';

const App = () => {
  const [trainText, setTrainText] = useState<string>(mockedText);
  const [exercisesData, setExercisesData] = useState<Exercise[]>(getExercisesFromInputString(mockedText));
  const [disableNext, setDisableNext] = useState(false);
  const [disableExerciseText, setDisableExerciseText] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [currentExerciseNumber, setCurrentExerciseNumber] = useState<number>(1);
  const [currentExerciseID, setCurrentExerciseID] = useState<string>(1);
  const [trainHasStarted, setTrainHasStarted] = useState<boolean>(false);
  const [startTrainingDate, setStartTrainingDate] = useState<Date>();
  const [previousRepeatEndTime, setPreviousRepeatEndTime] = useState<Date>();
  const [latestTraining, setLatestTraining] = useState<any>({});
  const alarmSoundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadAndSetReportFromFile = async () => {
      const { exercisesList, startDate, endDate } = await loadReportFromFile();
      setLatestTraining({
        exercisesList,
        exerciseDate: new Date(endDate).toLocaleDateString('ru-RU'),
        startTime: new Date(startDate).toLocaleTimeString('ru-RU'),
        endTime: new Date(endDate).toLocaleTimeString('ru-RU')
      });
      return exercisesList;
    };

    loadAndSetReportFromFile();
  },[]);

  const onTextChange = (e: { target: { value: string } }) => {
    const times = getExercisesFromInputString(e.target.value);
    setExercisesData(times);
    setTrainText(e.target.value)
  };

  const onClickNext = () => {
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
    const statusText = await saveReportToFile(trainReport);

    console.log(statusText); // parses JSON response into native JavaScript objects
  }

  const onClickShowPreviousTraining = async () => {

  }

  const nextButtonClass = seconds > 0 ? 'active blink-bg' : '';

  return (
    <div className="app-container">
      <div className="text-and-table-container">
        <textarea
          className="exercise-text"
          id=""
          // cols={80}
          rows={10}
          defaultValue={mockedText}
          // disabled={false || disableExerciseText}
          onChange={onTextChange}></textarea>
        
        <ExerciseTable
          exercises={exercisesData}
          // onSecondsChange={onSecondsChange}
          currentExerciseIndex={currentExerciseNumber}
          currentExerciseID={currentExerciseID}
          trainHasStarted={trainHasStarted}
        />
        <div style={{ position: 'absolute', display: trainHasStarted ? 'none' : 'block', bottom: '50px', left: '50px', backgroundColor: '#0000ffbd' }}>
          <button onClick={onClickStart} style={{ width: '30vw', height: '100px', backgroundColor: '#0000ff00' }}>
            START
          </button>
        </div>

      </div>

      <div className="timers-container">
        <div className="presetted-timers-container">
          <div className="previous-training-info">
            <strong>Предыдущая тренировка</strong><br/>
            {latestTraining.exercisesList && latestTraining.exercisesList.map((exerciseTitle: string) => <Fragment key={v4()}>{exerciseTitle}<br/></Fragment>)}
            
            <strong>Дата тренировки: </strong>
            {latestTraining.exerciseDate}<br/>
            
            <strong>Время начала: </strong>
            {latestTraining.startTime}<br/>
            
            <strong>Время окончания: </strong>
            {latestTraining.endTime}<br/>
          </div>
          <button onClick={onClickShowPreviousTraining}>
            Show previous training
          </button>
        </div>
        <CustomTimer />
        <div className="next-button-and-countdown-container">
          <button
            onClick={onClickNext}
            disabled={disableNext}
            className={nextButtonClass}>
            NEXT
          </button>

          <div className="next-countdown">{seconds}</div>
        </div>
        <div>
          <button onClick={onClickEndAndSave}>
            END AND SAVE
          </button>
        </div>
      </div>

      <br />
      <audio id="alarm-sound" ref={alarmSoundRef}>
        <source src={ALARM_SOUND_FILEPATH} type="audio/mpeg"></source>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default App;