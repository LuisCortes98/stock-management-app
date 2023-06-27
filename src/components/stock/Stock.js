import React, { useRef, useEffect, useState, Fragment, useCallback } from "react";

import { ArrowBack, Delete, Edit, Inventory } from '@mui/icons-material';

import { Table, Pagination, Tooltip, Whisper, Button } from 'rsuite';

import { useParams, Link } from "react-router-dom";

import { useAuth } from '../../providers/AuthProvider';

import ModalForm from "../shared/ModalForm";
import { CurrencyFormat } from "../shared/CurrencyFormat";

import { product as productModel } from "../../forms/Models";
import { product as productFormStructure } from "../../forms/Structures";

import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

import { dbFirestore } from "../../firebase-config";
import { collection, onSnapshot, doc, setDoc, query, where, deleteDoc, updateDoc, getDoc } from "firebase/firestore";

const { Column, HeaderCell, Cell } = Table;

const Stock = () => {

    let { accountId } = useParams();

    accountId = parseInt(accountId);

    const collectionRef = collection(dbFirestore, 'products');

    const { currentUser } = useAuth();

    const tableContainerRef = useRef(null);

    const [tableHeight, setTableHeight] = useState(500);

    const [limit, setLimit] = useState(15);
    const [page, setPage] = useState(1);

    const initProductForm = {
        name: "",   
        quantity: "",
        price: "",
        description: ""
    }

    const [openModal, setOpenModal] = useState(false);
    const [defaultFormData, setDefaultFormData] = useState(initProductForm);
    const [actionModal, setActionModal] = useState("");

    const [loadingProducts, setLoadingProducts] = useState(true);
    const [products, setProducts] = useState([]);
    const [productsTable, setProductsTable] = useState([]);

    const [accountinfo, setAccountInfo] = useState(null);

    const handleChangeLimit = dataKey => {
        setPage(1);
        setLimit(dataKey);
    };

    const createProduct = async (value) => {

        try {

            value.idAccount = accountId;

            const productRef = doc(collectionRef);

            await setDoc(productRef, value);

        } catch (error) {
            console.error(error);
        }

    }

    const updateProduct = async (value) => {

        try {

            const productRef = doc(collectionRef, value.id);
            updateDoc(productRef, value);

        } catch (error) {
            console.error(error);
        }

    }

    const deleteProduct = async (key) => {
        try {
            const productRef = doc(collectionRef, key);
            await deleteDoc(productRef);
        } catch (error) {
            console.error(error);
        }
    }

    const getAccount = useCallback(async () => {

        try {

            const accountRef = doc(dbFirestore, "accounts", accountId.toString());
            const accountSnap = await getDoc(accountRef);

            setAccountInfo(accountSnap.data());

        } catch (error) {
            console.error(error);
        }

    }, [accountId]);

    const generatePdf = async () => {

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();

        const { height } = page.getSize()

        // Title
        page.drawText(`Inventario de ${accountinfo.name}`, { x: 50, y: height - 40, size: 14 });

        //Items
        products.forEach((p, index) => {
            page.drawText(`Nombre: ${p.name} - Cantidad: ${p.quantity}  - Precio: ${p.price} - Descripción: ${p.description}`, { x: 50, y: height - 40 - (index + 1) * 20, size: 10, wordBreaks: ['break-all'] });
        })

        const pdfBytes = await pdfDoc.save();

        saveAs(new Blob([pdfBytes]), `inventario de ${accountinfo.name}.pdf`);

      };

    useEffect(() => {
        if (tableContainerRef.current) {
            setTableHeight(tableContainerRef.current.clientHeight - 35);
        }
    }, []);

    useEffect(() => {

        setLoadingProducts(true);

        const q = query(
            collectionRef,
            where('idAccount', '==', accountId)
        );

        const unsub = onSnapshot(q, (querySnapshot) => {
            const items = []
            querySnapshot.forEach((doc) => {
                items.push({...doc.data(), id: doc.id});
            });
            setProducts(items);
            setLoadingProducts(false);
        })
        return () => {
            unsub();
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        getAccount();
    }, [getAccount]);

    useEffect(() => {

        const dataFilter = products.filter((v, i) => {
            const start = limit * (page - 1);
            const end = start + limit;
            return i >= start && i < end;
        });

        setProductsTable(dataFilter);

    }, [page, limit, products]);

    return(
        <Fragment>
            <div className="column-start align-items-start bg-gray-200 py-4 px-4 vh-100 w-100">
                <Link to='/accounts' className="row-start align-items-center pe-pointer">
                    <ArrowBack className="txt-gray-500"/>
                    <p className="ms-1 txt-gray-500">Volver</p>
                </Link>
                <div className="col-12 row-between align-items-center my-2">
                    <div className="row-start align-items-center">
                        <Inventory className="txt-gray-800" sx={{ fontSize: 35 }}/>
                        <h1 className="mx-2 txt-gray-800">Inventario de {accountinfo?.name}</h1>
                    </div>
                    <div className="row-end align-items-center">
                        {
                            currentUser.role === 'admin' && 
                                <Button appearance="primary" onClick={() => {
                                    if (currentUser.role === 'admin') {
                                        setOpenModal(true);
                                        setActionModal('create');
                                        setDefaultFormData(initProductForm);
                                    }
                                }}>Agregar producto</Button>
                        }
                        <Button className="ms-3" appearance="ghost" onClick={() => generatePdf()}>Exportar a PDF</Button>
                    </div>
                </div>
                <div ref={tableContainerRef} className="table-data-container w-100 bg-white rounded-16 shadow">
                    <Table
                        affixHeader
                        headerHeight={50}
                        wordWrap
                        height={tableHeight}
                        data={productsTable}
                        loading={loadingProducts}>

                        <Column width={currentUser.role === 'admin' ? 100 : 0} verticalAlign="middle">
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
                                            <div onClick={() => currentUser.role === 'admin' && deleteProduct(rowData.id)}>
                                                <Delete className="txt-blue-500-hover txt-gray-500 pe-pointer"/>
                                            </div>
                                        </Whisper>
                                    </div>
                                )}
                            </Cell>
                        </Column>

                        <Column width={250} verticalAlign="middle">
                            <HeaderCell>Nombre</HeaderCell>
                            <Cell dataKey="name" />
                        </Column>

                        <Column width={150} verticalAlign="middle">
                            <HeaderCell>Cantidad</HeaderCell>
                            <Cell dataKey="quantity" />
                        </Column>

                        <Column width={150} verticalAlign="middle">
                            <HeaderCell>Price</HeaderCell>
                            <Cell>
                            {rowData => (
                                <CurrencyFormat value={rowData.price} currency="USD" />
                            )}
                            </Cell>
                        </Column>

                        <Column flexGrow={1} verticalAlign="middle">
                            <HeaderCell>Descripción</HeaderCell>
                            <Cell dataKey="description" />
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
                            total={products.length}
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
                title={actionModal === 'create' ? 'Agregar producto' : 'Editar producto'}
                defaultFormData={defaultFormData}
                model={productModel}
                formStructure={productFormStructure} 
                handleSubmit={actionModal === 'create' ? createProduct : updateProduct} 
                setOpen={setOpenModal} />
        </Fragment>

    )
};

export default Stock;
