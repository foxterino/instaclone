import React, { useEffect } from 'react';

function EventHandler({ eventName, callback, children }) {
  useEffect(() => {
    console.log('eventhandler');
    window.addEventListener(`${eventName}`, () => callback());

    return () => window[eventName] = null
  }, [callback, eventName]);

  return (
    <>
      {children}
    </>
  );
}

export default EventHandler;