//Step 1: load path and express
const path = require('path');
const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cors = require('cors');
//Step 2: create instance of application
const app = express();
//configure handlebars
app.engine('hbs', hbs({ defaultLayout: 'mylayout.hbs' }));
app.set('view engine', 'hbs');
app.set('views', 'views');

const userCarts = {};

//Step 3: define routes
app.use('/scripts', express.static(__dirname + '/node_modules/bootstrap/dist/'));
//app.get('/', function (req, res) {
//    res.render('index', { message: 'Welcome!' })
//  });
app.use('/pub', express.static(path.join(__dirname, 'public')));
app.get('/api/cart2', (req, res) => {
    const name = req.query.name;
    console.log("userCarts:", userCarts);
    if (name in userCarts) {
        res.status(200);
        res.render("index.hbs", {
            message: "User " + name + " is found",
            name: name,
            content: userCarts[name].content
        });
        return;
    }
    else {
        res.status(404);
        res.render("index.hbs", {
            message: "User " + name + " is not found."
        });
    }
});
app.post('/api/cart2', bodyParser.json(), bodyParser.urlencoded(), (req, res) => {
    const name = req.body.name;
    var content = req.body.content + "";
    var items = content.split(',');
    if (name == undefined || content == null || content == undefined || content.length == 0) {
        res.status(409);
        res.end();
        return;
    }
    var cart = add(name, items);
    res.status(200);
    res.render("index.hbs", {
        message: "Item(s) from user " + name + " is successfully added.",
        name: name,
        content: userCarts[name].content
    });
});

/////////////////////ANGULAR
const add = (name, items) => {
    var cart = null;

    if (userCarts.length == 0 || userCarts[name] == null || userCarts[name] == undefined) {
        cart = {
            name: name,
            content: items,
            saved: new Date().toString()
        };
        console.log("Added to userCarts:", cart);
        userCarts[name] = cart;
    }
    else {
        cart = userCarts[name];
        for (var j = 0; j < cart.content.length; j++) {
            for (var x = 0; x < items.length; x++) {
                if (cart.content[j] != items[x]) {
                    cart.content.push(items[x]);
                }
            }
        }
    }
    return cart;
};
app.get('/api/cart',
    (req, res) => {
        const name = req.query.name;
        if (!name) {
            res.status(400).json({ error: 'Missing name' });
            return;
        }
        console.log("userCarts:", userCarts);
        if (name in userCarts) {
            res.status(200).json(userCarts[name]);
            return;
        }
        else {
            res.status(404).json({ error: 'User ' + name + ' is not found.' });
        }
    });

app.post('/api/cart', bodyParser.json(), bodyParser.urlencoded(),
    (req, res) => {
        const tempCart = req.body;
        if (!('name' in tempCart) || !('content' in tempCart) || tempCart.content.length<=0){
            res.status(409).json({ error: 'Please enter name and content' });
            return;
        }
        const name = tempCart.name;
        var content = tempCart.content + "";
        var items = content.split(',');
        
        //use spread to assign
        //db[cart.name]= { 
        //  ...cart, //spread operator, doing the 2 lines below
        //  name, 
        //  content,
        //  saved: new Date().toString()
        //}

        var cart = add(name, items);
        res.status(201).json(cart);
    });
app.use(express.static(path.join(__dirname, 'angular')));

//Step 4: start the server
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;

app.listen(PORT, () => {
    console.info(`Application is started at port ${PORT} at ${new Date()} `);
});