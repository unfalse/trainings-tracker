import {v4} from 'uuid';

import { Exercise } from "../types";

const getExercisesFromInputString = (str: string): Exercise[] => {
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
        startArray: [],
      }));
  
    return exercises;
  };

export { getExercisesFromInputString };