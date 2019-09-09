import React, { useEffect } from 'react';

function EventHandler({ eventName, callback, children }) {
  useEffect(() => {
    window.addEventListener(eventName, callback);

    return () => window.removeEventListener(eventName, callback);
  }, [callback, eventName]);

  return (
    <>
      {children}
    </>
  );
}

export default EventHandler;