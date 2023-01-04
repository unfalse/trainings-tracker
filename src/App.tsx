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
      console.log(record);
      console.log(found);
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
  const [seconds, setSeconds] = useState(0);
  const alarmSoundRef = useRef(null);

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

      let breakDelay =
        Number(unchangedExercise.times) - 1 ===
        unchangedExercise.progress.length
          ? EXERCISES_BREAK_TIME
          : REPEATS_BREAK_TIME;

      const startTimer = () => {
        setTimeout(() => {
          breakDelay -= 1;
          setSeconds(breakDelay);
          if (breakDelay === 0) {
            setDisableNext(false);
            alarmSoundRef.current.play();
            return;
          }
          startTimer();
        }, 1000);
      };

      setDisableNext(true);
      setExercisesData(updatedExerciseData);
      startTimer();
    }
  };

  return (
    <div>
      <textarea
        className="exercise-text"
        id=""
        cols={50}
        rows={10}
        defaultValue={textData}
        onChange={onTextChange}></textarea>
      <ExerciseTable
        exercises={exercisesData}
        onSecondsChange={onSecondsChange}
      />
      <br />
      <button onClick={onNext} disabled={disableNext}>
        NEXT
      </button>
      <button
        onClick={() => {
          alarmSoundRef.current.pause();
          alarmSoundRef.current.currentTime = 0;
        }}>
        STOP ALARM
      </button>
      <div>{seconds}</div>
      <audio id="alarm-sound" ref={alarmSoundRef}>
        <source src="alarm.mp3" type="audio/mpeg"></source>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

// @ts-ignore
const ExerciseTable = ({exercises, onSecondsChange}) => {
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
                <tr key={exercise.id}>
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

export default App;
