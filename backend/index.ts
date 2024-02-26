import { Server, ic } from 'azle';
import cors from "cors";
import express from 'express';
import { StableBTreeMap, text, blob, nat8 } from 'azle';
import fs from 'fs';
import path from 'path';
import multer from 'multer'

export default Server(() => {
    const app = express();
    let fileMap = StableBTreeMap<text, {
        name: text,
        size: number,
        uploadedAt: Date,
        data: blob,

    }>(0);

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

    app.post('/upload', upload.single('file'), async (req, res) => {
        try {
          const files = req.files as { file: Express.Multer.File[] };
      
          if (!req.file) {
            throw new Error('No file uploaded');
          }
      
          const AFile = req.file;
      
          if (AFile.mimetype !== 'application/pdf') {
            await fs.promises.unlink(AFile.path);
            throw new Error('Only pdf are allowed');
          }
      
          const data = await fs.promises.readFile(AFile.path);
          fileMap.insert(AFile.originalname, {
            name: AFile.originalname,
            size: AFile.size,
            uploadedAt: new Date(),
            data: data,
          });
          res.status(200).send('File uploaded successfully');
        } catch (err) {
          console.error('Error uploading file:', err);
          res.status(500).send('Error uploading file');

        }
    });

    app.get('/research', async (req, res) => {
        try {
            const fileData = fileMap.values(); // get all file data from de map
            res.json(fileData); //send file data as a json response
        } catch (err) {
            console.error('Error retrieving files:', err);
            res.status(500).send('Error retrieving files');
        }
    });

    return app.listen();
});


