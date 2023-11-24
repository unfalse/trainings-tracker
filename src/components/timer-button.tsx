import { useRef, useState } from "react";

import { startAndUpdateTimer } from "../funcs/start-and-update-timer";
import { ALARM_SOUND_FILEPATH } from "../const";

export const TimerButton = ({delay = 60, onStart = () => {}, onFinish = () => {}}) => {
    const [timer, setTimer] = useState(0);
    const timerEndSoundRef = useRef<HTMLAudioElement>(null);
    const onTimerToggle = () => {
      startAndUpdateTimer(delay, setTimer, () => {
        timerEndSoundRef.current?.play();
        onFinish();
      });
      onStart();
    };
    const buttonClass = timer === 0 ? '' : 'active blink-bg';
    const isButtonDisabled = timer > 0;
  
    return (
      <div className="timer-button-container">
        <div className="timer-button__button-and-countdown-container">
          <button
            onClick={onTimerToggle}
            className={buttonClass}
            disabled={isButtonDisabled}>
            {delay}s |&gt;
          </button>
          <div className="timer-button__countdown"> {timer}</div>
  
          <span className="timer-button__copyright-container">
            <span className="timer-button__copyright">timer (c) nopefish</span>
          </span>
          <audio id="alarm-sound" ref={timerEndSoundRef}>
            <source src={ALARM_SOUND_FILEPATH} type="audio/mpeg"></source>
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    );
  };
  