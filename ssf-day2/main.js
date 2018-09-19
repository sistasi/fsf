//Step 1: load path and express
const path = require('path');
const express = require('express');
const fs = require('fs');
const resources = ['images','public'];

const randomImg = (array) =>{
   return array[Math.floor(Math.random() * array.length)];
};
//Step 2: create instance of application
const app = express();

//Step 3: define routes
//get the result from the arguments (ls -i)
console.info('>> ', process.argv);
let img = process.argv;
img.shift();
img.shift();
console.info('>> ', process.argv);

app.get('/image', (req, res)=> {
    res.status(200);
    res.type('text/html');
    const myArray = fs.readdirSync('./images/');
    //console.log(myArray);
    const randImg = myArray[Math.floor(Math.random() * myArray.length)];
    res.send(`<img src='/${randomImg(myArray)}'>`);
});

app.get('/random-image', (req, res)=> {
    res.status(200);
    //res.type('text/html');
    const myArray = fs.readdirSync('./images/');
    const randImg = myArray[Math.floor(Math.random() * myArray.length)];
    res.sendFile(path.join(__dirname, 'images',randImg));
});


for (let res of resources){
    console.log(`Adding ${res}`);
    app.use(express.static(path.join(__dirname, res)));
}

//Step 4: start the server
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;
app.listen(PORT, () =>{
    console.info(`Application is started at port ${PORT} at ${new Date()} `);
});
