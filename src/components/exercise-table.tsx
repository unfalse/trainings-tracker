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
    ))
  };

  return (
    <div style={{ color: trainHasStarted ? 'black' : 'darkgray' }}>
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
          {renderExercises()}
        </tbody>
      </table>
    </div>
  );
};