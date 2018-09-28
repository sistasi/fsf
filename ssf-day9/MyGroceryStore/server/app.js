/**************************/
//INITIALIZATION
/**************************/
require('dotenv').config();
const express = require("express"),
    mysql = require("mysql"),
    cors = require('cors'),
    bodyParser = require("body-parser"),
    multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        let fn = file.originalname.split(".");
        let ext = fn[fn.length - 1];
        console.log("File:", JSON.stringify(file), ", Filename:", fn[0] + '-' + Date.now() + "." + ext);
        cb(null, fn[0] + '-' + Date.now() + "." + ext);
    }
});
var upload = multer({ storage: storage });
const app = express();
app.use(cors());
/**************************/
//VARIABLE DECLARATION
/**************************/
const API_URI = "/api";
var sqlListGrocery = "select id, name, brand, upc12 from grocery_list where (brand like ?) || (name like ?) limit ? offset ?";
var sqlListGroceryCount = "select count(1) as count from grocery_list "
sqlListGroceryCount += " where (brand like ?) || (name like ?)";
var sqlListGroceryById = "select id, name, brand, upc12 from grocery_list where id=?";
var sqlListGroceryByUPC12 = "select id, name, brand, upc12 from grocery_list where upc12=?";
var sqlUpdateGrocery = "update grocery_list set name = ?, brand = ? where id = ?";
var sqlInsertGrocery = "insert into grocery_list (name, brand, upc12) values ( ?, ?, ?)";
/**************************/
// CONNECTING TO DB
/**************************/
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT
    //,debug:true
});

console.log("DB User:", process.env.DB_USER);
console.log("DB Name:", process.env.DB_NAME);

var makeQueryWithPromise = (sql, pool) => {
    console.log("SQL is:", sql);
    return (args) => {
        let queryPromise = new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                    return;
                }
                conn.query(sql, args || [], (err, results) => {
                    conn.release();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(results);

                })
            });
        });

        return queryPromise;
    }
};


var makeQueryWithoutParam = (sql, pool) => {
    console.log("SQL is:", sql);
    return () => {
        let queryPromise = new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                    return;
                }
                conn.query(sql, (err, results) => {
                    conn.release();
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(results);

                })
            });
        });

        return queryPromise;
    }
};

var listGrocery = makeQueryWithPromise(sqlListGrocery, pool);
var listGroceryCount = makeQueryWithPromise(sqlListGroceryCount, pool);
var listGroceryById = makeQueryWithPromise(sqlListGroceryById, pool);
var listGroceryByUPC12 = makeQueryWithPromise(sqlListGroceryByUPC12, pool);
var updateGrocery = makeQueryWithPromise(sqlUpdateGrocery, pool);
var insertGrocery = makeQueryWithPromise(sqlInsertGrocery, pool);
/**************************/
// COMMON FUNCTIONS
/**************************/
const validateParam = (field, defaultValue) => {
    return validateParamWithRes(field, field, defaultValue);
}
const validateParamWithRes = (field, returnedField, defaultValue) => {
    return field && field != '' ? returnedField : defaultValue;
}
/**************************/
//ROUTES
/**************************/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get(API_URI + '/list2', (req, res) => {
    console.log('list params:', req.query);
    const limit = validateParamWithRes(req.query.limit, parseInt(req.query.limit), 20);
    const offset = validateParamWithRes(req.query.offset, parseInt(req.query.offset), 0);
    const type = validateParam(req.query.selectionType, '');
    const keyword = validateParam(req.query.keyword, '');
    const brand = type == 'brand' || type == 'both' ? '%' + keyword + '%' : '%';
    const name = type == 'name' || type == 'both' ? '%' + keyword + '%' : '%';
    listGrocery([brand, name, limit, offset]).then((results) => {
        res.json(results);
    }).catch((error) => {
        res.status(500).json(error);
    });
});


app.get(API_URI + '/list', (req, res) => {
    console.log('list params:', req.query);
    const limit = validateParamWithRes(req.query.limit, parseInt(req.query.limit), 20);
    const offset = validateParamWithRes(req.query.offset, parseInt(req.query.offset), 0);
    const type = validateParam(req.query.selectionType, '');
    const keyword = validateParam(req.query.keyword, '');
    const brand = type == 'brand' || type == 'both' ? '%' + keyword + '%' : '%';
    const name = type == 'name' || type == 'both' ? '%' + keyword + '%' : '%';
    const sortField = validateParam(req.query.sortField, '');
    const sortDir = validateParam(req.query.sortDir, '');

    let sql = "select id, name, brand, upc12 from grocery_list where "
    sql += `(brand like '${brand}') || (name like '${name}') `;
    sql += `order by ${sortField} ${sortDir} limit ${limit} offset ${offset}`;

    makeQueryWithoutParam(sql, pool)().then((results) => {
        res.json(results);
    }).catch((error) => {
        res.status(500).json(error);
    });
});


app.get(API_URI + '/listCount', (req, res) => {
    console.log('listCount params:', req.query);
    const type = validateParam(req.query.selectionType, '');
    const keyword = validateParam(req.query.keyword, '');
    const brand = type == 'brand' || type == 'both' ? '%' + keyword + '%' : '%';
    const name = type == 'name' || type == 'both' ? '%' + keyword + '%' : '%';

    listGroceryCount([brand, name]).then((results) => {
        res.json(results);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

app.get(API_URI + '/list/:id', (req, res) => {
    const id = req.params.id;
    listGroceryById([id]).then((result) => {
        res.json(result);
    }).catch((error) => {
        res.status(500).json(error);
    });
});


app.get(API_URI + '/listUpc12/:upc12', (req, res) => {
    const id = req.params.upc12;
    listGroceryByUPC12([upc12]).then((result) => {
        res.json(result);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

app.put(API_URI + '/update', upload.single('avatar'), (req, res) => {
    const brand = req.body.params.brand;
    const name = req.body.params.name;
    const id = req.body.params.id;
    console.log("PUT QUery param: ", req.body.params);
    updateGrocery([name, brand, id]).then((result) => {
        console.log("Result for update:", result)
        res.json(result);
    }).catch((error) => {
        res.status(500).json(error);
    });
});


app.post(API_URI + '/add', (req, res) => {
    const brand = req.body.params.brand;
    const name = req.body.params.name;
    const upc12 = req.body.params.upc12;
    console.log("POST QUery param: ", req.params.body);
    let upc12result;
    listGroceryByUPC12([upc12]).then((results) => {
        console.log("UPC12 result:", results);
        if (results.length > 0) {
            res.status(500).json({ error: 'There exists UPC12: ' + upc12 });
            return;
        }

        insertGrocery([name, brand, upc12]).then((result) => {
            res.json(result);
        }).catch((error) => {
            res.status(500).json(error);
        });
    }).catch((error) => {
        res.status(500).json(error);
    });

});
/**************************/
// STARTUP
/**************************/
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
})