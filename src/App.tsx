import {
  useState,
  useRef,
} from 'react';
import {v4} from 'uuid';

import { ExerciseTable } from './components/exercise-table';
import { CustomTimer } from './components/custom-timer';
import { TimerButton } from './components/timer-button';
import { startAndUpdateTimer } from './funcs/start-and-update-timer';
import { ALARM_SOUND_FILEPATH, EXERCISES_BREAK_TIME, REPEATS_BREAK_TIME } from './const';
import { Exercise } from './types';
import './App.css';

const mockedText =
  'Бег на месте 5х30 сек\n\
Выпады назад 4х12 (с паузой внизу)\n\
Ягодичный мост 4х15(пауза наверху и напрягать ягодицы)\n\
Отжимания с ног 5х5 (пауза внизу)\n\
Лодочка 3х15\n\
Планка боковая 4х20 сек';

const getArr = (str: string): Exercise[] => {
  const records: string[] = str.split('\n');
  const rawArrays: RegExpMatchArray[] = records
    .filter(record => record !== '')
    .map((record: string) =>
      Array.from(record.matchAll(/(.+?)(\d+)х(\d{1,2})+(.+)?/gi),)[0]
    )
    .filter(found => found !== undefined);

  const exercises: Exercise[] =
    rawArrays
    .map((item) => ({
      id: v4(),
      title: item[1],
      times: item[2],
      repeats: item[3],
      after: item[4],
      isSeconds: false,
      progress: 0,
    }));

  return exercises;
};

const App = () => {
  const [textData, setTextData] = useState(mockedText);
  const [exercisesData, setExercisesData] = useState(getArr(mockedText));
  const [disableNext, setDisableNext] = useState(false);
  const [disableExerciseText, setDisableExerciseText] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentExerciseNumber, setCurrentExerciseNumber] = useState<number>(1);
  const alarmSoundRef = useRef<HTMLAudioElement>(null);
  // const exerciseDurationRef = useRef({start: 0, end: 0});

  const onTextChange = (e: {target: {value: any}}) => {
    const times = getArr(e.target.value);
    setExercisesData(times);
  };

  const onSecondsChange = (recordId: any) => {
    setExercisesData(
      exercisesData.map(exercise => ({
        ...exercise,
        isSeconds:
          recordId === exercise.id ? !exercise.isSeconds : exercise.isSeconds,
      })),
    );
  };

  const onNext = () => {
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
          };
        }
        return exercise;
      });

      let breakDelay: number = REPEATS_BREAK_TIME;
      // 4. Если число выполненных подходов равно общему числу подходов
      if (
        Number(exerciseInProgress.times) - 1 ===
        exerciseInProgress.progress
      ) {
        // 5. Устанавливаем интервал для перерыва между упражнениями
        breakDelay = EXERCISES_BREAK_TIME;
        if (currentExerciseNumber + 1 > exercisesData.length) {
          // 6. Если текущий номер упражнения больше чем общее количество упражнений,
          // то текущий номер будет равен первому упражнению
          setCurrentExerciseNumber(1);
        } else {
          // 7. Иначе текущий номер увеличиваем на 1
          setCurrentExerciseNumber(currentExerciseNumber + 1);
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

  const onStopAlarm = () => {
    alarmSoundRef.current?.pause();
    if (alarmSoundRef.current) {
      alarmSoundRef.current.currentTime = 0;
    }
  };

  const nextButtonClass = seconds > 0 ? 'active blink-bg' : '';

  return (
    <div className="app-container">
      <div className="text-and-table-container">
        <textarea
          className="exercise-text"
          id=""
          // cols={80}
          rows={10}
          defaultValue={textData}
          // disabled={false || disableExerciseText}
          onChange={onTextChange}></textarea>

        <ExerciseTable
          exercises={exercisesData}
          onSecondsChange={onSecondsChange}
          currentExerciseIndex={currentExerciseNumber}
        />
      </div>

      <div className="timers-container">
        <div className="presetted-timers-container">
          <div>
            <TimerButton delay={30} />
            <TimerButton delay={45} />
          </div>
          <div>
            <TimerButton delay={60} />
          </div>
        </div>
        <CustomTimer />
        <div className="next-button-and-countdown-container">
          <button
            onClick={onNext}
            disabled={disableNext}
            className={nextButtonClass}>
            NEXT
          </button>

          <div className="next-countdown">{seconds}</div>
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
