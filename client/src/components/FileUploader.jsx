import React, { useRef, useState } from 'react'
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import { InputTextarea } from 'primereact/inputtextarea';
import axios from 'axios';

const FileUploader = ({ setFile }) => {
    const maxFileSize = 500000000;
    const toast = useRef(null);
    const [totalSize, setTotalSize] = useState(0);
    const fileUploadRef = useRef(null);
    const [fileName, setFileName] = useState();
    
    const onTemplateSelect = (e) => {
        console.log('on template select', e.files)
        let _totalSize = totalSize;
        let files = e.files;
        setFile(files[0]);

        Object.keys(files).forEach((key) => {
            _totalSize += files[key].size || 0;
        });

        setTotalSize(_totalSize);
    };

    const onTemplateUpload = (e) => {
        console.log('on template upload')
        let _totalSize = 0;

        e.files.forEach((file) => {
            _totalSize += file.size || 0;
        });

        setTotalSize(_totalSize);
        console.log('set file to : ', e.files[0])
        setFile(e.files[0]);
        toast.current.show({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    };

    const onTemplateRemove = (file, callback) => {
        setTotalSize(totalSize - file.size);
        callback();
    };

    const onTemplateClear = () => {
        setTotalSize(0);
    };

    const headerTemplate = (options) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;
        const value = totalSize / 1000000;
        const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                {uploadButton}
                {cancelButton}
                <div className="flex ai-center gap-3 ml-auto" style={{gap:'20px', marginLeft:'auto'}}>
                    <span>{formatedValue} / {maxFileSize / 1000000} MB</span>
                    <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
                </div>
            </div>
        );
    };

    const itemTemplate = (file, props) => {
        return (
            <div className="flex ai-center flex-wrap">
                <div className="flex ai-center" style={{ width: '40%' }}>
                    <img alt={file.name} role="presentation" src={file.objectURL} width={100} />
                    <span className="flex flex-col text-left ml-3" style={{textAlign:'left'}}>
                        {file.name}
                        <small>{new Date().toLocaleDateString()}</small>
                    </span>
                </div>
                <Tag value={props.formatSize} severity="warning" className="px-3 py-2" />
                <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger ml-auto" onClick={() => onTemplateRemove(file, props.onRemove)} />
            </div>
        );
    };
    const emptyTemplate = () => {
        return (
            <div className="flex ai-center flex-col">
                <i className="pi pi-image mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
                    Drag and Drop Image Here
                </span>
            </div>
        );
    };
    const uploadHandler = async(e) => {
        
        const file = e.files[0];
        console.log('upload handler', e);
        console.log('upload: ', file)
        try{
            const formData = new FormData();
            formData.append("file",file);
            console.log('form data: ', formData)
            const res = await axios.post("http://localhost:8800/api/upload", formData)
            console.log('res: ', res);
            const { filename } = res.data;
            setFileName(filename);
        }  
        catch(err){
            console.log(err);
        }
    }
    const chooseOptions = { icon: 'pi pi-fw pi-images', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
    const uploadOptions = { icon: 'pi pi-fw pi-cloud-upload', iconOnly: true, className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined' };
    const cancelOptions = { icon: 'pi pi-fw pi-times', iconOnly: true, className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined' };
  return (
    <>
        <Toast ref={toast}></Toast>
    <FileUpload ref={fileUploadRef} name="file" url={`${process.env.REACT_APP_API_URL}upload`} multiple={false} accept="image/*,video/*" maxFileSize={maxFileSize}
    onSelect={onTemplateSelect} onError={onTemplateClear} onClear={onTemplateClear}
    headerTemplate={headerTemplate} itemTemplate={itemTemplate} emptyTemplate={emptyTemplate}
    chooseOptions={chooseOptions} uploadOptions={false} cancelOptions={cancelOptions}
    mode="advanced"
    />
    {fileName && 
        <h1>filename: {fileName}</h1>
    }
    </>
  )
}

export default FileUploader