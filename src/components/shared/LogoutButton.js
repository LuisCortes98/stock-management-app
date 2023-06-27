import React from "react";

import { Tooltip, Whisper } from 'rsuite';

import { Logout } from "@mui/icons-material";

import { signOut } from "firebase/auth"

import { auth } from '../../firebase-config'

const LogoutButton = () => {

    const logoutHandler = async () => {
        await signOut(auth);
    }

    return (
        <Whisper
            onClick={() => logoutHandler()}
            trigger="hover"
            placement="left"
            speaker={<Tooltip>Cerrar sesión</Tooltip>}>
                <Logout className="pe-pointer"/>
        </Whisper>
    )
};

export default LogoutButton;
