import { ONE_SECOND } from "../const";

export const startAndUpdateTimer = (delay: number, setTimerState: Function, onTimerEnd: Function) => {
    const start = Date.now();
    const intervalId = setInterval(function() {
      const delta = Math.floor((Date.now() - start) / ONE_SECOND);
      const secondsPassed = delay - delta;
      setTimerState(secondsPassed);
      if (secondsPassed <= 0) {
        // timerEndSoundRef.current.play();
        onTimerEnd();
        clearInterval(intervalId);
      }
    }, 100);
  };