import { Box, Image } from '@chakra-ui/react';
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};

const focusedStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

export interface propsTypes {
    uploadedPhoto: any
}

const UploadPhoto = ({ uploadedPhoto }: propsTypes) => {
    const [nowPhoto, setNewPhoto] = React.useState(null) as any
    const toBase64 = (file: any) => {
        return new Promise((resolve, reject) => {
            // console.log(file[0])
            const reader = new FileReader();
            reader.readAsDataURL(file[0]);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        accept: { 'image/*': [] },
        onDrop: async (files) => {
            const filenya = await toBase64(files)
            setNewPhoto(filenya)
            uploadedPhoto(filenya)
        }
    });

    const style: any = React.useMemo(() => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isFocused,
        isDragAccept,
        isDragReject
    ]);

    return (
        <div style={{textAlign: 'center', width: '100%', alignContent: 'center', alignItems: 'center'}}>
            <Box boxSize='sm'>
                <Image src={nowPhoto}/>
            </Box>
            <div {...getRootProps({ style })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
        </div>
    )
}

export default UploadPhoto
