const STORAGE_TRAINING_STATE_KEY = 'TRAINING-STATE';

export const STORAGE_TRAINING_START_KEY = 'TRAINING-START';

export const STORAGE_TRAINING_END_KEY = 'TRAINING-END';

export const STORAGE_TRAINING_REPORT_KEY = 'TRAINING-REPORT';

export const STORAGE_TRAINING_EMBEDS_KEY = 'TRAINING-EMBEDS';

export const STORAGE_TRAINING_EXERCISES_TEXT_LIST = 'TRAINING-EXERCISES-TEXT-LIST';

export const STORAGE_TRAINING_EXERCISE_ID = 'TRAINING-EXERCISE-ID';

export const STORAGE_LAST_NEXT_BUTTON_CLICK_TIME = 'TRAINING-LAST-NEXT-BUTTON-CLICK-TIME';

export const getLSTrainingState = () => {
    const data = localStorage.getItem(STORAGE_TRAINING_STATE_KEY);
    return data;
};

export const saveLSTrainingState = (data: string) => {
    localStorage.setItem(STORAGE_TRAINING_STATE_KEY, data);
}

export const getLSDataByKey = (key: string) => localStorage.getItem(key);

export const saveLSDataByKey = (key: string, data: string) => {
    localStorage.setItem(key, data);
}
