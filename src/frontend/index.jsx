import React, {useEffect, useState} from 'react';
import ForgeReconciler, {Stack, Inline, Text, Em, ButtonGroup, Button,Icon, SectionMessage, SectionMessageAction} from '@forge/react';
import {Modal, ModalBody, ModalTransition, ModalTitle, ModalFooter, ModalHeader} from '@forge/react';
import { view, showFlag } from '@forge/bridge';

import {invoke} from '@forge/bridge';

const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [prophecy, setProphecy] = useState(null);

    useEffect(() => {
        invoke('getProphecy').then(setProphecy);
    }, []);

    const generateProphecyBtnClicked = () => {
        invoke('generateProphecy').then(setProphecy);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <ModalTransition>
                {isModalOpen && (
                <Modal onClose={() => view.close()} >
                    <ModalHeader>
                        <ModalTitle>Your prophecy</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        <Text><Em>{prophecy ? prophecy : 'Loading...'}</Em></Text>
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button onClick={generateProphecyBtnClicked}>Open cookie</Button>
                            <Button appearance="primary" onClick={handleCloseModal}>Close</Button>
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
