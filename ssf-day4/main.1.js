//Step 1: load path and express
const path = require('path');
const express = require('express');
const hbs = require('express-handlebars');
const uuidV1 = require('uuid/v1');
const uuidV5 = require('uuid/v5');
const bodyParser = require('body-parser');

//Step 2: create instance of application
const app = express();
//configure handlebars
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');
app.set('views', 'views');

//Step 3: define routes
//GET /uuid
app.get('/uuid', (req, res) => {
    const uuid = uuidV1();
    //res.status(200).type('text/html').send(`<h3><code>${uuid}</code></h3>`);
    res.set('Cache-control','no-cache');//for sensitive data, do not ask it to cache, set tis
    res.format({
        'text/html': () => {
            //res.send(`<h3><code>${uuid}</code></h3>`);
            res.render('online_uuid', { uuid: uuid });
        },
        'application/json': () => {
            res.json({
                uuid: uuid,
                generated_on: new Date().toString()
            });
        },
        'text/plain': () => {
            res.send(uuid);
        },
        default: () => {
            res.status(406).end();
        }
    });
});

app.get('/uuids', (req, res) => {
    const count = parseInt(req.query.uuidCount) || 1;
    const uuidList = [];
    const text = "<h4>This is another body</h4>"
    for (let i = 0; i < count; i++) {
        uuidList.push(uuidV1());
    }
    res.status(200);
    res.render('list_of_uuids', { version: 1, uuidList: uuidList, anotherBody: text, layout: 'test.hbs' });
});

//parse json and form-urlencoded payload
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.post('/genPassword', (req, res) => {
    const name = req.body.name;
    const pwd = uuidV5(name, uuidV5.DNS).replace(/-/g,'').substring(16);
    res.status(200).type('text/plain').send(pwd);
});

app.post('/uuidV5', bodyParser.json(), bodyParser.urlencoded(),
    (req, res) => {
        const namespace = req.body.namespace;
        const count = parseInt(req.body.uuidCount)||2;
        const uuidList = [];
        for (let i = 0; i < count; i++) {
            uuidList.push(uuidV5(namespace, uuidV1()));
        }
        res.status(200);
        res.render('list_of_uuids', { version:5, uuidList: uuidList });
    });

app.use(express.static(path.join(__dirname, 'public')));

//Step 4: start the server
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;

app.listen(PORT, () => {
    console.info(`Application is started at port ${PORT} at ${new Date()} `);
});