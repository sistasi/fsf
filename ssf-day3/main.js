//Step 1: load path and express
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const request = require('request');
const fs = require('fs');
var asciify = require('asciify-image');

//Step 2: create instance of application
const app = express();

//Step 3: define routes
const myArray = fs.readdirSync('./images/');
const randomImg = (array) =>{
    return array[Math.floor(Math.random() * array.length)];
 };

app.get ('/image', (req, res) =>{
    res.status(200);
    res.format({
        'text/html': () => {
            res.send(`<img src='/${randomImg(myArray)}'>`);
        },
        'images/jpg': () => {
            res.sendFile(path.join(__dirname, 'images',randomImg(myArray)));
        },
        'images/png': () => {
            res.sendFile(path.join(__dirname, 'images',randomImg(myArray)));
        },
        'application/json': () => {
            res.json({image: path.join(__dirname, 'images',randomImg(myArray))});
        },
        'text/plain':()=>{
            asciify(path.join(__dirname, 'images',randomImg(myArray)), function (err, asciified) {
                // Print to console
                //console.log(asciified);
                res.send(asciified);
              });
        },
        default:()=>{
            res.status(406);
            res.end();
        }    
    });
});

app.get ('/getImage', (req, res) =>{
    console.log("Accept:", req.get('Accept') );
    request.get("http://localhost:3000/image", { headers: { Accept: req.get('Accept')}},
        (err, response, body) => {
            if (err){
                res.status(400);
                res.type('text/plain');
                res.send(err);
                return;
            };
            res.status(200);
            //console.log('Body:', body);
            res.end(body);
        }
    )
});

app.use(express.static(path.join(__dirname, 'images')));

///////////////////

const roll = () => Math.floor(Math.random()* 6 )+1;
app.get ('/dice', (req, res) =>{
    res.status(200);
    res.format({
        'text/html': () => {
            res.send(`<h1>Dice roll is ${roll()}.</h1>`);
        },
        'application/json': () => {
            res.json({dice_roll: roll()});
        }
    });
});

app.get('/calldice', (req, res)=>{
   // console.log(`Accept: ${req.get('Accept')}`);
    request.get('http://localhost:3000/dice', {headers: {Accept: 'text/html'}}, 
        (err, response, body)=>{
            if (err){
                console.log(err);
                res.status(400);
                res.type('text/plain');
                res.send(err);
                return;
            }
            res.status(200);
            res.send(body);
    })
})

app.get('/rates', (req, res)=> {
    const param = {
        access_key: '3e95ad7de47e1a72ebc30d9e26090fc8'
    };
    request.get('http://data.fixer.io/api/latest', {qs: param},
        (err, response, body) =>{ 
            if (err){
                res.status(400);
                res.type('text/plain');
                res.send(err);
                return;
            }
            const result = JSON.parse(body); 
            const rates = result.rates;
            const ratesArray = [];
            for (let c of Object.keys(rates)){
                ratesArray.push({currency:c, rate: rates[c]});
            }
            res.status(200);
            res.render('rate',
            {
                rates: ratesArray, 
                baseRate: result.base,
                rateDate: result.date,
                layout:false});
        }
    )
});

app.get('/httpbin',(req, res)=>{
    const param = {
        name:'test &abc 123',
        email:'test@gmail.com'
    };
    //console.log("params: ",  querystring.stringify(param));
    //request.get('https://httpbin.org/get?' + querystring.stringify(param), //old way
    request.get('https://httpbin.org/get?', { qs: param }, //new way
        (err, result, body) =>{ 
            if (err){
                res.status(400);
                res.type('text/plain');
                res.send(JSON.stringify(err));
                return;
            }
            console.info (">> body: ", body);
            res.status(200);
            res.json(JSON.parse(body));
        }
    )
});

app.get('/time', 
    (req, res)=> {
        console.log(`Accept: ${req.get('Accept')}`);

        res.status(200);
        res.format({
            'text/html': () => {
                res.render('time', 
                { 
                    time: (new Date()).toString(), 
                    testing: '<p>test for the <b>html rendering</b></p>',
                    layout:false
                })
                //res.send(`<h1>Current time is ${new Date()} </h1>`);
            },
            'application/json': () => {
                res.json({time: new Date()});
            },
            'text/plain': () => {
                const data = {time: new Date()};
                res.send(`Json string is: ${JSON.stringify(data)}.`);
            },
            default: ()=>{
                res.status(406);
                res.end();
            } 
        })
});


//Step 4: start the server
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;

app.listen(PORT, () =>{
    console.info(`Application is started at port ${PORT} at ${new Date()} `);
});