import {v4} from 'uuid';
import { Exercise, ExerciseTableParams } from "../types";

export const ExerciseTable = ({ exercises, currentExerciseID, trainHasStarted }: ExerciseTableParams) => {
  const renderExercises = () => {
    return (exercises.map((
      exercise: Exercise,
      exerciseIndex: number,
    ) => {
      const currentRowClass =
        currentExerciseID === exercise.id
          ? 'exercise-table-row-active'
          : 'exercise-table-row-inactive';

      return (<>
        <tr key={v4()} className={currentRowClass}>
          <td style={{ fontWeight: '600'}}>Название и номер</td>
          <td>{exerciseIndex + 1} - {exercise.title}</td>
        </tr>
        <tr key={v4()} className={currentRowClass}>
          <td style={{ fontWeight: '600'}}>Подходы и повторения</td>
          <td>{exercise.times} x {exercise.repeats}, {exercise.after}</td>
        </tr>
        <tr key={v4()} className={currentRowClass}>
          <td style={{ fontWeight: '600'}}>Прогресс</td>
          <td>{exercise.progress}</td>
        </tr>
        <tr>
          <td style={{ borderTop: '1px solid black' }}></td><td style={{ borderTop: '1px solid black' }}></td>
        </tr>
      </>);
    },
    ))
  };

  return (
    <div style={{ color: trainHasStarted ? 'black' : 'darkgray', textAlign: 'justify' }}>
      <table>
        <tbody>
          <tr>
            <td style={{ borderTop: '1px solid black' }}></td><td style={{ borderTop: '1px solid black' }}></td>
          </tr>
          {renderExercises()}
        </tbody>
      </table>
    </div>
  );
};
