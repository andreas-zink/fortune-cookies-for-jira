import React, {useEffect, useState} from 'react';
import ForgeReconciler, {Text, Box, Button, xcss} from '@forge/react';
import {invoke} from '@forge/bridge';

const App = () => {
    const [prophecy, setProphecy] = useState(null);

    useEffect(() => {
        invoke('getProphecy').then(setProphecy);
    }, []);

    const generateProphecyBtnClicked = () => {
        invoke('generateProphecy').then(setProphecy);
    };

    return (
        <>
            <Text>Your project prophecy:</Text>
            <Box padding='space.400' backgroundColor='color.background.accent.yellow.subtlest'>
                <Text>{prophecy ? prophecy : 'Loading...'}</Text>
            </Box>
            <Button onClick={generateProphecyBtnClicked}>Next</Button>
        </>
    );
};

ForgeReconciler.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
