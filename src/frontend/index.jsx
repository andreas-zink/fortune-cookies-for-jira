import React, {useEffect, useState} from 'react';
import ForgeReconciler, {
    Button,
    ButtonGroup,
    Em,
    Inline,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    ModalTransition,
    Spinner,
    Text,
} from '@forge/react';
import {invoke, view} from '@forge/bridge';

const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [prophecy, setProphecy] = useState(null);
    const [isDevEnv, setIsDevEnv] = useState(false);

    useEffect(() => {
        invoke('getProphecy').then(setProphecy);
    }, []);
    useEffect(() => {
        invoke('isDevEnv').then(setIsDevEnv);
    }, []);

    const getNextProphecyBtnClicked = () => {
        setProphecy(null);
        invoke('getNextProphecy').then(setProphecy);
    };

    const resetProjectBtnClicked = () => {
        invoke('resetProject').then();
    };
    const resetAllBtnClicked = () => {
        invoke('resetAllProjects').then();
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <ModalTransition>
                {isModalOpen && (
                    <Modal shouldScrollInViewport="false" onClose={() => view.close()}>
                        <ModalHeader>
                            <ModalTitle>Your project prophecy</ModalTitle>
                        </ModalHeader>
                        <ModalBody>
                            <Inline>
                                {!prophecy && (
                                    <Spinner label="loading"/>
                                )}
                                <Text><Em>{prophecy}</Em></Text>
                            </Inline>
                        </ModalBody>
                        <ModalFooter>
                            {isDevEnv && (
                                <ButtonGroup>
                                    <Button onClick={resetProjectBtnClicked} appearance='warning'>Reset Project</Button>
                                    <Button onClick={resetAllBtnClicked} appearance='warning'>Reset All</Button>
                                </ButtonGroup>
                            )}
                            <ButtonGroup>
                                <Button onClick={getNextProphecyBtnClicked} type='submit'
                                        iconBefore="premium">Next</Button>
                                <Button onClick={handleCloseModal} autoFocus='true'>Close</Button>
                            </ButtonGroup>
                        </ModalFooter>
                    </Modal>
                )}
            </ModalTransition>
        </>
    );
};

ForgeReconciler.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
