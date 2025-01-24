import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [prophecy, setProphecy] = useState(null);
  useEffect(() => {
    invoke('generateProphecy', { example: 'my-invoke-variable' }).then(setProphecy);
  }, []);
  return (
    <>
      <Text>Your project prophecy:</Text>
      <Text>{prophecy ? prophecy : 'Loading...'}</Text>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
