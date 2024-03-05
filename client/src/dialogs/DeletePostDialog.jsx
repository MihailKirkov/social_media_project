import React, { useEffect, useRef, useState } from 'react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { DeletePostById } from '../functions/PostFunctions';

export const DeletePostDialog = ({ visible, setVisible, postId, postTitle, toast }) => {
        useEffect(()=> {confirmDialog({
        visible: visible,
        message: `Are you sure you want to delete post "${postTitle}"?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        defaultFocus: 'reject',
        acceptClassName: 'p-button-danger',
        accept,
        reject
    });
        // setVisible(true);
    }, [])
    const accept = () => {
        console.log('accept');
        DeletePostById(postId);
        toast?.current?.show({ severity: 'warn', summary: 'Confirmed', detail: 'Post has been deleted', life: 3000 });
        setVisible(false);
    }

    const reject = () => {
        setVisible(false);
    }
        
    return (
        <>
            {/* <Toast ref={toast} /> */}
            <ConfirmDialog />
        </>
        
    )
}

export default DeletePostDialog