import React, {useEffect, useState} from 'react';
import ForgeReconciler, {
    Button,
    ButtonGroup,
    Em,
    Image,
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
import logo from '../resources/images/fortune-cookie.svg'

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
                            <Inline alignBlock="center" space="space.050">
                                <Image width="20px" src={logo} alt=""/>
                                <ModalTitle>Your project prophecy</ModalTitle>
                            </Inline>
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
                                <Button onClick={handleCloseModal} autoFocus='true'>Close</Button>
                                <Button onClick={getNextProphecyBtnClicked} type='submit'
                                        appearance='primary'>Regenerate</Button>
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
