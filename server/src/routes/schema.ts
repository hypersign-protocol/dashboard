import { Router } from 'express';
import { hypersignSDK } from '../config'
import { registerSchema1 } from '../setup/bootstrapCredential';
import { validateSchemaCreation } from '../middleware/others';


export = (hypersign) => {

    const router = Router();

    router.post('/create', hypersign.authorize.bind(hypersign), validateSchemaCreation, async (req, res) => {
        try {
            const { userData } = req.body;
            const r = await registerSchema1({
                author: userData.id,
                ...req.body
            })
            
            res.status(200).send({ status: 200, message: r, error: null });
        } catch (e) {
            res.status(500).send({ status: 500, message: null, error: e.message });
        }

    })


    router.get('/get', hypersign.authorize.bind(hypersign), async (req, res) => {
        try {
            const { userData } = req.body
            const schemaList = await hypersignSDK.schema.getSchema({author: userData.id});
            res.status(200).send({ status: 200, message: schemaList, error: null });
        } catch (e) {
            res.status(500).send({ status: 500, message: null, error: e.message });
        }

    })

    return router;
}