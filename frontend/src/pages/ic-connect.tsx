import { AuthButton, useRestActor } from "@bundly/ic-react";
import React, { useState, useRef } from 'react';

export default function IcConnectPage() {
    const backend = useRestActor("backend");
    const fileInputRef = useRef<HTMLInputElement>(null); // Usamos useRef para acceder al elemento input
    const [files, setFiles] = useState([]);

    async function upload(file: File) {
        try {

            //CREATE A FORMDATA OBJECT AND APPEND THE FILE TO it
            const formData = new FormData()
            formData.append("file", file);

            const response = await backend.post("/upload", formData, {
                
            });

            console.log({ response });
        } catch (error) {
            console.error({ error });
        }
    }
    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            upload(file);
        } else {
            console.error("NO FILE SELECTED");
        }
    }

    async function research() {
        try {
            const response = await backend.get("/research");
            const fileData = response.json;
                console.log(fileData);
                setFiles([...fileData]); // Update the files state (not working)
              
        } catch (error) {
            console.error({ error });
        }
    }

    return (
        <div>
            <h1>Asimov Lab</h1>
            <AuthButton />
            <div>
                {/*input element for file selection*/}
                <input ref={fileInputRef} type="file" onChange={handleFileChange} style={{ display: 'none' }} id="fileInput" />
                <label htmlFor="fileInput" style={{padding:'10px 20px', backgroundColor:'blue', color:'white', borderRadius:'5px',cursor:'pointer'}}>Upload Paper</label>
                <button onClick={() => research()}>Research</button>
            
            </div>
        </div>
    );
}
