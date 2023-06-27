import React, { useRef, useEffect, useState, Fragment } from "react";

import { ArrowCircleRight, Delete, Edit, LocationCity } from '@mui/icons-material';

import { Table, Pagination, Tooltip, Whisper, Button } from 'rsuite';

import { Link } from "react-router-dom";

import { useAuth } from '../../providers/AuthProvider';

import ModalForm from "../shared/ModalForm";
import LogoutButton from "../shared/LogoutButton";

import { account as accountModel } from "../../forms/Models";
import { account as accountFormStructure } from "../../forms/Structures";

import { dbFirestore } from "../../firebase-config";
import { collection, onSnapshot, doc, setDoc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";

const { Column, HeaderCell, Cell } = Table;

const Accounts = () => {

    const collectionRef = collection(dbFirestore, 'accounts')

    const tableContainerRef = useRef(null);

    const { currentUser } = useAuth();

    const [tableHeight, setTableHeight] = useState(500);

    const [limit, setLimit] = useState(15);
    const [page, setPage] = useState(1);

    const initAccountForm = {
        id: "",
        name: "",   
        address: "",
        phone: ""
    }

    const [openModal, setOpenModal] = useState(false);
    const [defaultFormData, setDefaultFormData] = useState(initAccountForm);
    const [actionModal, setActionModal] = useState("");

    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [accountsTable, setAccountsTable] = useState([]);

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    const createAccount = async (value) => {

        try {

            const accountRef = doc(collectionRef, value.id);
            const accountSnap = await getDoc(accountRef);

            if (!accountSnap.exists()) {
                await setDoc(accountRef, value);
            } else {
                console.error("Esta cuenta ya esta registrada");
            }

        } catch (error) {
            console.error(error);
        }

    }

    const updateAccount = async (value) => {

        try {

            const accountRef = doc(collectionRef, value.id);
            updateDoc(accountRef, value);

        } catch (error) {
            console.error(error);
        }

    }

    const deleteAccount = async (key) => {
        try {
            const accountRef = doc(collectionRef, key);
            await deleteDoc(accountRef);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (tableContainerRef.current) {
            setTableHeight(tableContainerRef.current.clientHeight);
        }
    }, []);

    useEffect(() => {
        setLoadingAccounts(true);
        const unsub = onSnapshot(collectionRef, (querySnapshot) => {
            const items = []
            querySnapshot.forEach((doc) => {
                items.push(doc.data());
            });
            setAccounts(items);
            setLoadingAccounts(false);
        })
        return () => {
            unsub();
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {

        const dataFilter = accounts.filter((v, i) => {
            const start = limit * (page - 1);
            const end = start + limit;
            return i >= start && i < end;
        });

        setAccountsTable(dataFilter);

    }, [page, limit, accounts]);

    return(
        <Fragment>
            <div className="column-start align-items-start bg-gray-200 py-4 px-4 vh-100 w-100">
                <div className="col-12 mb-2 row-between align-items-center">
                    <div className="row-start align-items-center">
                        <LocationCity className="txt-gray-800" sx={{ fontSize: 35 }}/>
                        <h1 className="mx-2 txt-gray-800">Cuentas</h1>
                    </div>
                    <div className="row-end align-items-center">
                        {
                            currentUser.role === 'admin' &&
                                <Button appearance="primary" className="me-3" onClick={() => {
                                    setOpenModal(true);
                                    setActionModal('create');
                                    setDefaultFormData(initAccountForm);
                                }}>Crear cuenta</Button>
                        }
                        <LogoutButton/>
                    </div>
                </div>
                <div ref={tableContainerRef} className="table-data-container w-100 bg-white rounded-16 shadow">
                    <Table
                        affixHeader
                        headerHeight={50}
                        wordWrap
                        height={tableHeight}
                        data={accountsTable}
                        loading={loadingAccounts}>

                        <Column width={currentUser.role === 'admin' ? 120 : 0} verticalAlign="middle">
                            <HeaderCell></HeaderCell>
                            <Cell>
                                {rowData => (
                                    <div className="row-center align-items-center gap-3">
                                        <Whisper
                                            trigger="hover"
                                            placement="bottom"
                                            speaker={<Tooltip>Editar</Tooltip>}>
                                                <div onClick={() => {
                                                    if (currentUser.role === 'admin'){
                                                        setOpenModal(true);
                                                        setActionModal('edit');
                                                        setDefaultFormData(rowData);
                                                    }
                                                }}><Edit className="txt-blue-500-hover txt-gray-500 pe-pointer"/></div>
                                            
                                        </Whisper>
                                        <Whisper
                                            trigger="hover"
                                            placement="bottom"
                                            speaker={<Tooltip>Eliminar</Tooltip>}>
                                            <div onClick={() => currentUser.role === 'admin' && deleteAccount(rowData.id)}>
                                                <Delete className="txt-blue-500-hover txt-gray-500 pe-pointer"/>
                                            </div>
                                        </Whisper>
                                    </div>
                                )}
                            </Cell>
                        </Column>

                        <Column width={180} verticalAlign="middle" fixed>
                            <HeaderCell>Nit</HeaderCell>
                            <Cell dataKey="id" />
                        </Column>

                        <Column width={300} verticalAlign="middle">
                            <HeaderCell>Nombre</HeaderCell>
                            <Cell dataKey="name" />
                        </Column>

                        <Column width={250} verticalAlign="middle">
                            <HeaderCell>Teléfono</HeaderCell>
                            <Cell dataKey="phone" />
                        </Column>

                        <Column width={250} verticalAlign="middle">
                            <HeaderCell>Dirección</HeaderCell>
                            <Cell dataKey="address" />
                        </Column>

                        <Column flexGrow={1} align='center' verticalAlign="middle">
                            <HeaderCell>Inventario</HeaderCell>
                            <Cell>
                                {rowData => (
                                    <Link to={`/accounts/${rowData.id}/stock`}>
                                        <ArrowCircleRight className="txt-blue-500 mx-4 pe-pointer"/>
                                    </Link>
                                    
                                )}
                            </Cell>
                        </Column>

                    </Table>
                    <div className="p-3 border-top">
                        <Pagination
                            prev
                            next
                            first
                            last
                            boundaryLinks
                            maxButtons={2}
                            size="s"
                            layout={['total', '-', 'limit', '|', 'pager']}
                            total={accounts.length}
                            limitOptions={[10, 30, 50]}
                            limit={limit}
                            activePage={page}
                            onChangePage={setPage}
                            onChangeLimit={handleChangeLimit}
                        />
                    </div>
                </div>
            </div>
            <ModalForm 
                open={openModal}
                title={actionModal === 'create' ? 'Crear cuenta' : 'Editar cuenta'}
                defaultFormData={defaultFormData}
                model={accountModel}
                formStructure={accountFormStructure} 
                handleSubmit={actionModal === 'create' ? createAccount : updateAccount} 
                setOpen={setOpenModal} />
        </Fragment>

    )
};

export default Accounts;
