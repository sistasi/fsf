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
            res.json({image: randomImg(myArray)});
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

app.use(express.static(path.join(__dirname, 'images')));
//Step 4: start the server
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;

app.listen(PORT, () =>{
    console.info(`Application is started at port ${PORT} at ${new Date()} `);
});