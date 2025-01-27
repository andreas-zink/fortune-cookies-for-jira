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

    useEffect(() => {
        invoke('getProphecy', context).then(setProphecy);
    }, [context]);

    const generateProphecyBtnClicked = () => {
        setProphecy(null);
        invoke('generateProphecy', context).then(setProphecy);
    };

    const clearProphecyBtnClicked = () => {
        invoke('clearProphecyContext', context).then( );
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
                        <ModalTitle>Your project prophecy</ModalTitle>
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
                            <Button onClick={clearProphecyBtnClicked}>Clear</Button>
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
