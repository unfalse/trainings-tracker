import { useState } from "react";
import { TimerButton } from "./timer-button";

export const CustomTimer = () => {
    const [timerValue, setTimerValue] = useState(20);
    const [disableInput, setDisableInput] = useState(false);
  
    const onTimerValueChange = (e: {target: {value: string}}) => {
      setTimerValue(Number(e.target.value));
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
          disabled={disableInput}
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
