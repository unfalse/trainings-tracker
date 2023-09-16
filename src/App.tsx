// @ts-nocheck
/*
 * TODO:
 * - добавить поддержку упражнений с неизвестным количеством подходов - просто писать вместо повторений N, например 5хN, * при этом после строки прогресса добавить кнопку STOP для перехода к следующему упражнению (с перерывом 2 минуты)
 * - отключить поле ввода после первого нажатия NEXT
 *
 */
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactFragment,
  ReactPortal,
  useState,
  useRef,
  useEffect,
} from 'react';
import {v4} from 'uuid';

import './App.css';

const REPEATS_BREAK_TIME = 60;
const EXERCISES_BREAK_TIME = 90;
const ONE_SECOND = 1000;
const ALARM_SOUND_FILEPATH = 'beep-6.mp3';

const mockedText =
  'Бег на месте 5х30 сек\n\
Выпады назад 4х12 (с паузой внизу)\n\
Ягодичный мост 4х15(пауза наверху и напрягать ягодицы)\n\
Отжимания с ног 5х5 (пауза внизу)\n\
Лодочка 3х15\n\
Планка боковая 4х20 сек';

const getArr = (str: string) => {
  const records = str.split('\n');
  const exercises = records
    .map((record: string) => {
      const found = Array.from(
        record.matchAll(/(.+?)(\d+)х(\d{1,2})+(.+)?/gi),
      )[0];
      // console.log(record);
      // console.log(found);
      return found
        ? {
            id: v4(),
            title: found[1],
            times: found[2],
            repeats: found[3],
            after: found[4],
            isSeconds: false,
            progress: '',
          }
        : '';
    })
    .filter(record => record !== '');
  return exercises;
};

const App = () => {
  const [textData, setTextData] = useState(mockedText);
  const [exercisesData, setExercisesData] = useState(getArr(mockedText));
  const [disableNext, setDisableNext] = useState(false);
  const [disableExerciseText, setDisableExerciseText] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(1);
  const alarmSoundRef = useRef(null);
  const exerciseDurationRef = useRef({start: 0, end: 0});

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
    const unchangedExercise = exercisesData.find(
      (exercise: {times: any; progress: string | any[]}) => {
        return Number(exercise.times) > exercise.progress.length;
      },
    );

    if (unchangedExercise) {
      const updatedExerciseData = exercisesData.map(exercise => {
        if (unchangedExercise.id === exercise.id) {
          return {
            ...exercise,
            progress: `${exercise.progress}${Number(
              exercise.progress.length + 1,
            )}`,
          };
        }
        return exercise;
      });

      let breakDelay = REPEATS_BREAK_TIME;
      if (
        Number(unchangedExercise.times) - 1 ===
        unchangedExercise.progress.length
      ) {
        breakDelay = EXERCISES_BREAK_TIME;
        const updatedCurrentExercise =
          currentExercise + 1 > exercisesData.length ? 1 : currentExercise + 1;
        //        console.log(updatedCurrentExercise);
        setCurrentExercise(updatedCurrentExercise);
      }

      //      console.log(exercisesData.length);

      setDisableNext(true);
      setExercisesData(updatedExerciseData);
      startAndUpdateTimer(breakDelay, setSeconds, () => {
        setDisableNext(false);
        alarmSoundRef.current.play();
      });
    }
  };

  const onStopAlarm = () => {
    alarmSoundRef.current.pause();
    alarmSoundRef.current.currentTime = 0;
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
          currentExercise={currentExercise}
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
            <TimerButton delay={90} />
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

// @ts-ignore
const ExerciseTable = ({exercises, onSecondsChange, currentExercise}) => {
  return (
    <div>
      <table>
        <tbody>
          <tr>
            <th>№</th>
            <th>Название</th>
            <th>Подходы</th>
            <th>х</th>
            <th>Повторы</th>
            <th className="centered-text">Примечания</th>

            <th className="centered-text">Прогресс</th>
          </tr>
          {exercises.map(
            (
              exercise: {
                id: string;
                title: string;
                times: string;
                repeats: string;
                after: string;
                progress: string;
              },
              exerciseIndex: number,
            ) => {
              const onCheckBoxSecondsChange = () => {
                onSecondsChange(exercise.id);
              };

              const currentRowClass =
                currentExercise === exerciseIndex + 1
                  ? 'exercise-table-row-active'
                  : 'exercise-table-row-inactive';

              return (
                <tr key={exercise.id} className={currentRowClass}>
                  <td>{exerciseIndex + 1}</td>
                  <td>{exercise.title}</td>
                  <td className="centered-text">{exercise.times}</td>
                  <td>x</td>
                  <td className="centered-text">{exercise.repeats}</td>
                  <td className="centered-text">{exercise.after}</td>
                  <td className="centered-text">{exercise.progress}</td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
};

const startAndUpdateTimer = (delay, setTimerState, onTimerEnd) => {
  const start = Date.now();
  const intervalId = setInterval(function() {
    const delta = Math.floor((Date.now() - start) / ONE_SECOND);
    const secondsPassed = delay - delta;
    setTimerState(secondsPassed);
    if (secondsPassed <= 0) {
      // timerEndSoundRef.current.play();
      onTimerEnd();
      clearInterval(intervalId);
    }
  }, 100);
};

const CustomTimer = () => {
  const [timerValue, setTimerValue] = useState(20);
  const [disableInput, setDisableInput] = useState(false);

  const onTimerValueChange = (e: {target: {value: string}}) => {
    setTimerValue(e.target.value);
  };

  const onTimerStart = () => {
    setDisableInput(true);
  };

  const onTimerFinish = () => {
    setDisableInput(false);
  };

  return (
    <div>
      Custom timer:
      <br />
      <input
        type="text"
        onChange={onTimerValueChange}
        disable={disableInput.toString()}
        value={timerValue}
      />
      <TimerButton
        delay={timerValue}
        onStart={onTimerStart}
        onFinish={onTimerFinish}
      />
    </div>
  );
};

const TimerButton = ({delay = 60, onStart = () => {}, onFinish = () => {}}) => {
  const [timer, setTimer] = useState(0);
  const timerEndSoundRef = useRef(null);
  const onTimerToggle = () => {
    startAndUpdateTimer(delay, setTimer, () => {
      timerEndSoundRef.current.play();
      onFinish();
    });
    onStart();
  };
  const buttonClass = timer === 0 ? '' : 'active blink-bg';
  const isButtonDisabled = timer > 0;

  return (
    <div className="timer-button-container">
      <div className="timer-button__button-and-countdown-container">
        <button
          onClick={onTimerToggle}
          className={buttonClass}
          disabled={isButtonDisabled}>
          {delay}s |&gt;
        </button>
        <div className="timer-button__countdown"> {timer}</div>

        <span className="timer-button__copyright-container">
          <span className="timer-button__copyright">timer (c) nopefish</span>
        </span>
        <audio id="alarm-sound" ref={timerEndSoundRef}>
          <source src={ALARM_SOUND_FILEPATH} type="audio/mpeg"></source>
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default App;
