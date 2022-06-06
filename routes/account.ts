import * as express from 'express';
import * as cors from 'cors';
import * as bodyparser from 'body-parser';

export class Jwt {
    static authenticateToken(req, res, next) {
        console.log("Not implemented");
        next();
    }
}

const router = express.Router();

router.use(bodyparser.json());
router.use(cors({
    origin: true,
    credentials: true
}));

router.post('/login', async function (req, res) {
    res.status(501).send("Not implemented");
});

router.post('/account', async function (req, res) {
    res.status(501).send("Not implemented");
});

router.get('/info', Jwt.authenticateToken, async function (req, res) {
    res.status(501).send("Not implemented");
});

router.post('/token', async function (req, res) {
    res.status(501).send("Not implemented");
});

router.delete('/logout', Jwt.authenticateToken, async function (req, res) {
    res.status(501).send("Not implemented");
});

module.exports = router;