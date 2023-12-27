export type Exercise = {
    /** ID упражнения в формате UUID */
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

    /**  (не используется) Флаг использования секунд вместо повторений */
    isSeconds: boolean;

    /** Массив с временем начала каждого повторения */
    startArray: Date[];
};
  
export type ExerciseTableParams = {
    exercises: Array<Exercise>;
    // onSecondsChange: Function;
    trainHasStarted: boolean;
    currentExerciseID: string;
};

export type ExerciseLog = {
    title: string;
    timeNumber: number;
    duration: number;
};

export type TrainInfo = {
    /** Дата и время начала тренировки */
    startDate: Date;
    
    /**  Дата и время окончания тренировки */
    endDate: Date;
}