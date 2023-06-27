import React, { useEffect, useState } from "react";

import { Modal, Form, InputGroup, Button } from 'rsuite';

const { Group, ControlLabel, Control } = Form;

const TextField = ({name, label, accepter, ...rest}) => {
    return(
        <Group controlId={name}>
            <ControlLabel>{label}</ControlLabel>
            <InputGroup inside>
                <Control
                    name={name}
                    placeholder={label}
                    accepter={accepter}
                    {...rest}/>
            </InputGroup>
        </Group>
    )
}

const ModalForm = (props) => {

    const [formValue, setFormValue] = useState({});

    const handleClose = () => {
        props.setOpen(false);
    };

    useEffect(() => props.defaultFormData !== {} && setFormValue(props.defaultFormData), [props.defaultFormData])

    return(
        <Modal open={props.open} onClose={handleClose} size="xs">
            <Modal.Header>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header> 
            <Modal.Body>
                <div className="column-start align-items-start px-2">
                    <Form layout="vertical" model={props.model} formValue={formValue} onChange={(value) => setFormValue(value)}>
                        {
                            props.formStructure.map(element =>
                                <TextField key={element.name} name={element.name} label={element.label}/>)
                        }
                    </Form>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="row-end align-items-center">
                    <Button className="text-center" appearance="primary" 
                        onClick={() => { 
                            props.handleSubmit(formValue);
                            handleClose();
                        }}>Aceptar</Button>
                    <Button className="text-center" appearance="subtle" onClick={handleClose}>Cancelar</Button>
                </div>
            </Modal.Footer> 
        </Modal>
    )
};

export default ModalForm;
