import React, { useEffect } from 'react';

const EventHandler = ({ eventName, callback, children }) => {
  useEffect(() => {
    window.addEventListener(eventName, callback);

    return () => window.removeEventListener(eventName, callback);
  }, [eventName, callback]);

  return (
    <>
      {children}
    </>
  );
}

export default EventHandler;