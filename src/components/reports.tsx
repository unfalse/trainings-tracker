import { useState } from "react";

import { Exercise, TrainReport } from "../types";

export const ReportsTab = () => {
    const [trainReports, setTrainReports] = useState<TrainReport[]>();

    const onTextChange = (e: { target: { value: string } }) => {
        const { value } = e.target;
        let parsedTrainReports;
        try {
            parsedTrainReports = JSON.parse(value);
            setTrainReports(parsedTrainReports);
        } catch(e) {
            console.error(e);
            setTrainReports(undefined);
        }
    };

    const RenderTime = (d?: Date) => d ? new Date(d).toLocaleTimeString('ru-RU') : '';

    const RenderDate = (d?: Date) => d ? new Date(d).toLocaleDateString('ru-RU') : '';

    const addLeadingZero = (value: number) => value > 10 ? value : `0${value}`;

    const RenderTrainReport = ({ trainReport }) => {
        if (trainReport === undefined) return null;
        const { trainText, trainDuration, endDate, exercisesData } = trainReport;
        let { startDate } = trainReport;

        if (!startDate && exercisesData && exercisesData.length > 0 && exercisesData[0].startArray && exercisesData[0].startArray.length > 0) {
            startDate = exercisesData[0].startArray[0];
        }

        const duration: number = new Date(endDate).getTime() - new Date(startDate).getTime();
        // Converting time into hh:mm:ss format

        // Total number of seconds in the difference
        const totalSeconds = Math.floor(duration / 1000);

        // Total number of minutes in the difference
        const totalMinutes = Math.floor(totalSeconds / 60);

        // Total number of hours in the difference
        const totalHours = Math.floor(totalMinutes / 60);

        // Getting the number of seconds left in one minute
        const remSeconds = totalSeconds % 60;

        // Getting the number of minutes left in one hour
        const remMinutes = totalMinutes % 60;

        const durationString = `${totalHours}:${addLeadingZero(remMinutes)}:${addLeadingZero(remSeconds)}`;

        return (
            <div>
                <div>Дата: {RenderDate(startDate)}</div>
                <div>Время начала: {RenderTime(startDate)}</div>
                <div>Время окончания: {RenderTime(endDate)}</div>
                <div>Продолжительность: {durationString}</div>
                <br/>

                {exercisesData.map((exercise: Exercise, exerciseIndex: number) => (
                    <div key={exercise.id}>
                        <div>{exerciseIndex + 1}. {exercise.title} {exercise.times} x {exercise.repeats} {exercise.after}</div>
                        <div>{exercise.startArray ? exercise.startArray.map(startTime => RenderTime(startTime)).join(' | ') : null}</div>
                    </div>
                ))}

                <hr />
            </div>
        )
    }

    return (
        <div className="text-and-table-container">
            <textarea rows={10} onChange={onTextChange} />
            <br />
            {trainReports ? trainReports.map((trainReport: TrainReport, trainReportIndex: number) => <RenderTrainReport key={trainReportIndex} trainReport={trainReport} />) : null}
        </div>
    )
};
