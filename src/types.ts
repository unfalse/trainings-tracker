export type Exercise = {
    id: string;

    /** Название упражнения */
    title: string;

    /** Подходы */
    times: string;

    /** Повторения */
    repeats: string;

    /** Примечания */
    after: string;

    /** Число выполненных подходов */
    progress: number;
    isSeconds: boolean;
};
  
export type ExerciseTableParams = {
    exercises: Array<Exercise>;
    onSecondsChange: Function;
    currentExerciseIndex: number;
};