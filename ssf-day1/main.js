//Step 1: load path and express
const path = require('path');
const express = require('express');

//Step 2: create instance of application
const app = express();

//Step 3: define routes
//Serve resources from public
app.use(express.static(path.join(__dirname,'angular')));
app.use(express.static(path.join(__dirname,'public')));

app.use((req, resp)=>{
    //better way
    resp.status(404);
    resp.sendFile(path.join(__dirname, 'public',"404.html"));
    //not so good as it only tells the human, the above will tell the system and human
    //resp.redirect("/404.html");
});
//Step 4: start the server
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;

//console.log('>>> APP_PORT', port);

const hello = function (name){
	return function(){
	    console.log('hello function:', name); 
	}
}

app.listen(PORT, () =>{
    console.info(`Application is started at port ${PORT} at ${new Date()} `);
    hello('DEF')();
});

