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
  const [disableStart, setDisableStart] = useState(true);
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
        setCurrentExercise(currentExercise + 1);
      }

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

  const onStart = () => {};

  return (
    <div>
      <button onClick={onStart} disabled={disableStart}>
        START
      </button>
      <br />
      <textarea
        className="exercise-text"
        id=""
        cols={50}
        rows={10}
        defaultValue={textData}
        // disabled={false || disableExerciseText}
        onChange={onTextChange}></textarea>
      <ExerciseTable
        exercises={exercisesData}
        onSecondsChange={onSecondsChange}
        currentExercise={currentExercise}
      />
      <div style={{display: 'inline-block', margin: '20px'}}>
        <button
          onClick={onNext}
          disabled={disableNext}
          className={seconds > 0 ? 'active' : ''}>
          NEXT
        </button>
        <div
          style={{
            display: 'inline-block',
            marginRight: '10px',
            marginLeft: '10px',
            width: '30px',
          }}>
          {seconds}
        </div>
      </div>
      <br />
      <TimerButton delay={30} />
      <TimerButton delay={45} />
      <TimerButton delay={60} />
      <TimerButton delay={90} />
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
    <div style={{textAlign: 'left'}}>
      <table>
        <tbody>
          <tr>
            <th>№</th>
            <th>Название</th>
            <th>Подходы</th>
            <th>х</th>
            <th>Повторы</th>
            <th style={{textAlign: 'center'}}>Примечания</th>

            <th style={{textAlign: 'center'}}>Прогресс</th>
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

              return (
                <tr
                  key={exercise.id}
                  style={{
                    backgroundColor:
                      currentExercise === exerciseIndex + 1 ? 'lime' : 'white',
                  }}>
                  <td>{exerciseIndex + 1}</td>
                  <td>{exercise.title}</td>
                  <td style={{textAlign: 'center'}}>{exercise.times}</td>
                  <td>x</td>
                  <td style={{textAlign: 'center'}}>{exercise.repeats}</td>
                  <td style={{textAlign: 'center'}}>{exercise.after}</td>
                  <td style={{textAlign: 'center'}}>{exercise.progress}</td>
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

const TimerButton = ({delay = 60}) => {
  const [timer, setTimer] = useState(0);
  const timerEndSoundRef = useRef(null);
  const onTimerToggle = () => {
    startAndUpdateTimer(delay, setTimer, () => {
      timerEndSoundRef.current.play();
    });
  };

  return (
    <div
      style={{
        border: '1px solid black',
        borderRadius: '15px',
        padding: '15px',
        margin: '5px',
        display: 'inline',
      }}>
      <button onClick={onTimerToggle} className={timer === 0 ? '' : 'active'}>
        {delay}s |&gt;
      </button>
      <div
        style={{
          width: '30px',
          display: 'inline-block',
          marginRight: '10px',
          marginLeft: '10px',
        }}>
        {' '}
        {timer}
      </div>

      <span style={{position: 'absolute', display: 'none'}}>
        <span
          style={{
            position: 'relative',
            bottom: '18px',
            backgroundColor: 'white',
            fontSize: '8pt',
            right: '105px',
          }}>
          timer (c) nopefish
        </span>
      </span>
      <audio id="alarm-sound" ref={timerEndSoundRef}>
        <source src={ALARM_SOUND_FILEPATH} type="audio/mpeg"></source>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default App;
