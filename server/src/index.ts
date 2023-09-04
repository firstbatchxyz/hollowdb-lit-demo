import express, { Request, Response } from 'express';
import {HollowClientService} from "./client/client";
import { hollowRouter } from './routes/routes';
var cors = require('cors')
const PORT = 5000;

class App{
    public app: express.Application;
    public client: HollowClientService;

    constructor() {
        this.app = express();
        this.config();
    }

    private config(): void {
        this.app.use(express.json());
        this.app.use((req, res, next) => {
            this.app.use(cors());
            this.app.use(hollowRouter)
            next();
        });
    }
}
let app = new App().app;

app.listen(PORT, () => {
    console.log(`Relay server running on http://localhost:${PORT}`);
});
