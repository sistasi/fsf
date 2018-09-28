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
        cb(null, '../thumbnails/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
});
var upload = multer({ storage: storage });
const app = express();
app.use(cors());
/**************************/
//VARIABLE DECLARATION
/**************************/
const API_URI = "/api";
var sqlSearchBooks = "select id, title, cover_thumbnail, author_firstname, author_lastname from books ";
var sqlSearchBooksCount = "select count(1) as count from books ";
var sqlSearchBookById = "select  id, title, cover_thumbnail, author_firstname, author_lastname, modified_date, created_date, is_deleted from books where id=?";
var sqlUpdateBookCover = "update books set cover_thumbnail=?, modified_date=sysdate() where id=?";
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

//var searchBooks = makeQueryWithPromise(sqlSearchBooks, pool);
//var searchBooksCount = makeQueryWithPromise(sqlSearchBooksCount, pool);
var searchBookById = makeQueryWithPromise(sqlSearchBookById, pool);
var updateBookCover = makeQueryWithPromise(sqlUpdateBookCover, pool);
/**************************/
// COMMON FUNCTIONS
/**************************/
const validateParam = (field, defaultValue) => {
    return validateParamWithRes(field, field, defaultValue);
}
const validateParamWithRes = (field, returnedField, defaultValue) => {
    return field && field != '' ? returnedField : defaultValue;
}

const setParam = (type, keyword, selection, defaultValue)=>{
    if (type != "all" && keyword.length >0){
        return (type == selection ? '%' + keyword + '%':'')
    }
    if ((type == 'all' || type == selection) && keyword.length>0){
        return  '%' + keyword + '%';
    }
    return defaultValue;
}

const constructSQL = (initSql, params, withLimitOffset)=>{
    const limit = validateParamWithRes(params.limit, parseInt(params.limit), 10);
    const offset = validateParamWithRes(params.offset, parseInt(params.offset), 0);
    const type = validateParam(params.selectionType, '');
    const keyword = validateParam(params.keyword, '');
    const sortField = validateParam(params.sortField, 'title');
    const sortDir = validateParam(params.sortDir, 'asc');
    //console.log("limitL", limit,",offset:", offset, ",type:", type,",keyword:", keyword,",sortField:", sortField,",sortDir:",sortDir);
    let sql = initSql + " where ";
    if (type == 'author_firstname'|| type == 'all'){
        sql += "(author_firstname like '" + (keyword.length>0? `%${keyword}%`:'%') + "')"
    }
    if (type == 'author_lastname'|| type=='all'){
        sql += (type=='all'? '||':'') + "(author_lastname like '" + (keyword.length>0? `%${keyword}%`:'%') + "')"
    }
    if (type == 'title'|| type=='all'){
        sql += (type=='all'? '||':'') + "(title like '" + (keyword.length>0? `%${keyword}%`:'%') + "')"
    }
    if (withLimitOffset){
        sql += ` order by ${sortField} ${sortDir} limit ${limit} offset ${offset}`;
    }
    return sql;
}
/**************************/
//ROUTES
/**************************/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get(API_URI + '/search', (req, res) => {
    console.log('search params:', req.query);    
    let sql = constructSQL(sqlSearchBooks, req.query, true);
    makeQueryWithoutParam(sql, pool)().then((results) => {
        res.json(results);
    }).catch((error) => {
        res.status(500).json(error);
    });
});


app.get(API_URI + '/searchCount', (req, res) => {
    console.log('count params:', req.query);
    let sql = constructSQL(sqlSearchBooksCount, req.query, false);

    makeQueryWithoutParam(sql, pool)().then((results) => {
        res.json(results);
    }).catch((error) => {
        res.status(500).json(error);
    });
});

app.get(API_URI + '/search/:id', (req, res) => {
    const id = req.params.id;
    searchBookById([id]).then((result) => {

        res.json(result);
    }).catch((error) => {
        res.status(500).json(error);
    });
});


app.post(API_URI + '/update', upload.single('file'), bodyParser.urlencoded(), (req, res) => {
    const cover_thumbnail = req.body.cover_thumbnail;
    const id = req.body.id;
    console.log("UPDATE id:",id,",cover_thumbnail:", cover_thumbnail);
    updateBookCover([cover_thumbnail, id]).then((result) => {
        console.log("Result for update:", result)
        res.json(result);
    }).catch((error) => {
        console.error("Error updating:", error)
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
