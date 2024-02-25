import { Server, ic } from 'azle';
import cors from "cors";
import express from 'express';
import { StableBTreeMap, text, blob } from 'azle';
import fs from 'fs';
import path from 'path';
import multer from 'multer'

export default Server(() => {
    const app = express();
    let fileMap = StableBTreeMap<text, blob>(0);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads'); // Specify the directory where files will be stored temporarily
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname); // Use the original filename
        }
    });
    
    // Initialize Multer with the configured storage
    const upload = multer({ storage: storage });

    app.use(cors());
    app.use(express.json());

    app.use((req, res, next) => {
        if (ic.caller().isAnonymous()) {
            res.status(401);
            res.send();
        } else {
            next();
        }
    });
    
//using POST METHOD TO UPLOAD PDF FILES
    
    app.post('/upload', upload.single('file'), (req, res) => {
        const files = req.files as { file: Express.Multer.File[] };
        // Some code

        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        let AFile = req.file;

        if (AFile.mimetype !== 'application/pdf') {
            fs.unlinkSync(AFile.path);
            return res.status(400).send('Only pdf are alowwed')
        }

        fs.readFile(AFile.path, (err, data) => {
            if (err) {
                console.error('error reading file:', err);
                return res.status(500).send('Error reading file');
            }

            fileMap.insert(AFile.originalname, data);
            res.status(200).send('File uploaded succesfully');
        })
    });
    
    app.get('/research', (req, res) => {
        res.statusCode = 200;
        res.send(ic.caller());
    });

    app.get('/health', (req, res) => {
        res.send().statusCode = 204;
    });

    return app.listen();
});
