//Step 1: load path and express
const path = require('path');
const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const request = require('request');
const moment = require('moment');

//Step 2: create instance of application
const app = express();
app.engine('html', hbs({
    defaultLayout: false,
    helpers: {
        'grouped_each': function (every, context, options) {
            var out = '',
                subcontext = {}, // Declare an object, instead of an array
                i;
            if (context && context.length > 0) {
                for (i = 0; i < context.length; i++) {
                    if (i > 0 && i % every === 0) {
                        out += options.fn(subcontext);
                        subcontext = {};
                    }

                    // Declare keys on your object,
                    // instead of blindly pushing into an empty array
                    subcontext[i] = context[i];
                }
                out += options.fn(subcontext);
            }
            return out;
        }
    }
}));
app.set('view engine', 'html');

//set cache data
const cache = {};

var currentTime = moment();
const interval = 5;
const maxResultCount = 100;
const expiryTime = 60; //in seconds
const resultDdList = () => {
    var list = [];
    for (var i = interval; i <= maxResultCount; i = i + interval) {
        list.push(i);
    }
    return list;
};

const constructParam = (keyword, resultCount) => {
    return {
        api_key: 'zNeWDtDLIk6BfeOFguKlXmsDxLbuhnn0',
        q: keyword,
        limit: resultCount,
        offset: 0,
        rating: 'G',
        lang: 'en'
    };
};

const callGiphy = (giphyType, keyword, resultCount, res) => {
    var param = constructParam(keyword, resultCount);
    console.log(`Calling giphy for: ${JSON.stringify(param)}`);
    request.get('https://api.giphy.com/v1/' + giphyType + '/search',
        { qs: param },
        (err, response, body) => {
            if (err) {
                console.log(err);
                res.status(400);
                res.render('index', {
                    resultDdList: resultDdList,
                    keyword: keyword,
                    message: 'There is some error: ' + err
                });
                return;
            }

            const data = JSON.parse(body);
            const result = addToCache(keyword, resultCount, data);
            var elapsedTime = moment().diff(currentTime, 'seconds', true);
            res.status(200);
            res.render('index', {
                resultDdList: resultDdList,
                keyword: keyword,
                message: "Search result for '" + keyword + "' from giphy (" + elapsedTime + " second(s))",
                data: result
            });
        })
};

const addToCache = (keyword, resultCount, data) => {
    var result = keyword in cache ? cache[keyword] :
        { keyword: keyword, resultCount: resultCount, data: [], saved: '' };
    result.data = [];
    for (var i = 0; i < data.data.length; i++) {
        const img = data.data[i]
        result.data.push({
            url: img.images.fixed_width.url,
            height: img.images.fixed_width.height,
            width: img.images.fixed_width.width,
        })
    }
    result.saved = new Date().toString();
    cache[keyword] = result;
    console.log(`Saving to cache: ${keyword}, data length:${result.data.length}`)
    return result;
};

//Step 3: define routers
//homepage
app.get('/', function (req, res) {
    res.render('index', { resultDdList: resultDdList })
});

app.get('/api/giphy', (req, res) => {
    currentTime = moment();
    const keyword = req.query.keyword;
    var giphyType = req.query.giphyType;
    const resultCount = parseInt(req.query.resultCount);
    if (!keyword || !resultCount) {
        res.status(400);
        res.render('index', {
            keyword: keyword,
            resultDdList: resultDdList,
            message: 'Please enter search terms and select the no of result'
        });
        return;
    }

    var result = keyword in cache ? cache[keyword] :
        { keyword: keyword, resultCount: resultCount, data: [], saved: '' };
    console.log('condition: %s %s %s', result.data.length > 0, result.resultCount >= resultCount,
        parseInt(moment().diff(moment(new Date(result.saved)), 'seconds', true)) <= expiryTime);
    console.log('Result count vs param: %s vs %s', result.resultCount, resultCount);
    console.log('Date saved vs now: %s vs %s', result.saved, moment());
    console.log('Sec Diff: ',
        result.saved != '' ?
            moment().diff(moment(new Date(result.saved)), 'seconds', true) : 'new');
    if (result.data.length > 0 && result.resultCount >= resultCount &&
        parseInt(moment().diff(moment(new Date(result.saved)), 'seconds', true)) <= expiryTime) {
        var returnedRes = { ...result }; // make a copy
        returnedRes.data = [];
        for (var i = 0; i < resultCount; i++) {
            returnedRes.data.push(result.data[i]);
        }
        console.log('Retrieving result with length ', returnedRes.data.length);
        var elapsedTime = moment().diff(currentTime, 'seconds', true);
        res.status(200);
        res.render('index', {
            resultDdList: resultDdList,
            message: "Search result for '" + keyword + "' from cache (" + elapsedTime + " second(s))",
            keyword: keyword,
            data: returnedRes
        });
    }
    else {
        callGiphy(giphyType, keyword, resultCount, res);
    }
});

//Step 4: start the server  
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;

app.listen(PORT, () => {
    console.info(`Application is started at port ${PORT} at ${new Date()} `);
});