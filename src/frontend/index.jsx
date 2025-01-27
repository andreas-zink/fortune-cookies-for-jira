import React, {useEffect, useState} from 'react';
import ForgeReconciler, {
    useProductContext,
    Button,
    ButtonGroup,
    Em, Inline,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    ModalTransition, Spinner,
    Text,
} from '@forge/react';
import {invoke, view} from '@forge/bridge';

const App = () => {
    const context = useProductContext();
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [prophecy, setProphecy] = useState(null);
    const [isDevEnv, setIsDevEnv] = useState(false);

    useEffect(() => {
        invoke('getProphecy', context).then(setProphecy);
        invoke('isDevEnv').then(setIsDevEnv);
    }, [context]);

    const generateProphecyBtnClicked = () => {
        setProphecy(null);
        invoke('generateProphecy', context).then(setProphecy);
    };

    const resetBtnClicked = () => {
        invoke('reset', context).then();
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
                            <ButtonGroup>
                                {isDevEnv && (
                                    <Button onClick={resetBtnClicked} type='reset' appearance='warning'>Reset</Button>
                                )}
                                <Button onClick={generateProphecyBtnClicked} iconBefore="premium">Next</Button>
                                <Button onClick={handleCloseModal}>Close</Button>
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
