import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { port, logger } from './config';
import http from 'http';
import HypersignAuth from 'hypersign-auth-js-sdk';
import routes from './routes';

export default function app() {
    const app = express();
    const server = http.createServer(app);
    const hypersign = new HypersignAuth(server);
    

    app.use(express.json());
    app.use(cors());
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(express.static('public'));


    // Routes
    app.use("/hs/api/v2/auth", routes.auth(hypersign));
    app.use("/hs/api/v2/app", routes.app(hypersign));
    app.use("/hs/api/v2/price", routes.pricing());
    app.use("/hs/api/v2/subscription", routes.subscription(hypersign));
    app.use("/hs/api/v2/schema", routes.schema(hypersign));
        

    server.listen(port, () => logger.info(`The server is running on port ${port}`));

}
