import React, { useState} from "react";

import { Form, InputGroup, ButtonToolbar, Button, Schema, useToaster, Notification } from 'rsuite';

import AvatarIcon from '@rsuite/icons/legacy/Avatar';
import KeyIcon from '@rsuite/icons/legacy/Key';

import { Navigate, useNavigate } from "react-router-dom";

import { signInWithEmailAndPassword } from "firebase/auth"

import { auth } from '../../firebase-config'

import { useAuth } from '../../providers/AuthProvider';

const Login = () => {

    const navigate = useNavigate();
    const toaster = useToaster();
    const { currentUser } = useAuth();

    const model = Schema.Model({
        email: Schema.Types.StringType().isEmail('Please enter a valid email address.'),
        password: Schema.Types.StringType().isRequired('This field is required.')
    });

    const [formValue, setFormValue] = useState({})

    const loginHandler = async () => {

        try {

            const user = await signInWithEmailAndPassword(auth, formValue.email, formValue.password);

            if (user)
                navigate('/accounts')

        } catch {

            toaster.push(<Notification type='error' header='error' closable>Usuario y/o contraseña incorrectos.</Notification>);

        }

    }

    return(
        currentUser ? 
            <Navigate to='/'/> :
            <section className="column-center align-items-center bg-blue-gradient w-100 vh-100">
                <div className="col-11 col-md-5 column-center align-items-center bg-white rounded-16 shadow h-75">
                    <h1 className="mb-4 txt-gray-800">StockMaster</h1>
                    <Form model={model} onSubmit={loginHandler} onChange={(value) => setFormValue(value)} layout="vertical">
                        <Form.Group controlId="email">
                            <InputGroup inside>
                                <Form.Control
                                    name="email"
                                    placeholder="Email"/>
                                <InputGroup.Addon>
                                    <AvatarIcon />
                                </InputGroup.Addon>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId={'password'}>
                            <InputGroup inside>
                                <Form.Control
                                    name="password"
                                    placeholder="Password"
                                    type="password"
                                    autoComplete="off"/>
                                <InputGroup.Addon>
                                    <KeyIcon />
                                </InputGroup.Addon>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group>
                            <ButtonToolbar>
                                <Button type="submit" className="text-center w-100" appearance="primary">Submit</Button>
                            </ButtonToolbar>
                        </Form.Group>
                    </Form>
                </div>
            </section>
    )
};

export default Login;
