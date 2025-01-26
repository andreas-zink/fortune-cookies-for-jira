import React, {useEffect, useState} from 'react';
import ForgeReconciler, {
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
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [prophecy, setProphecy] = useState(null);

    useEffect(() => {
        invoke('getProphecy').then(setProphecy);
    }, []);

    const generateProphecyBtnClicked = () => {
        setProphecy(null);
        invoke('generateProphecy').then(setProphecy);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <ModalTransition>
                {isModalOpen && (
                <Modal shouldScrollInViewport="false" onClose={() => view.close()} >
                    <ModalHeader>
                        <ModalTitle>Your prophecy</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        <Inline>
                            {!prophecy && (
                                <Spinner label="loading" />
                            )}
                            <Text><Em>{prophecy}</Em></Text>
                        </Inline>
                    </ModalBody>
                    <ModalFooter>
                        <ButtonGroup>
                            <Button onClick={generateProphecyBtnClicked}>Next</Button>
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
