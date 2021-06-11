module.exports = function (app, addon) {
  //https://text-analysis.atlassian.net/wiki/rest/api/content
  // https://text-analysis.atlassian.net/wiki/rest/api/content/{id}?expand=body.storage
  // Root route. This route will serve the `atlassian-connect.json` unless the
  // documentation url inside `atlassian-connect.json` is set
  app.get('/', function (req, res) {
    res.format({
      // If the request content-type is text-html, it will decide which to serve up
      'text/html': function () {
        res.redirect('/atlassian-connect.json');
      },
      // This logic is here to make sure that the `atlassian-connect.json` is always
      // served up when requested by the host
      'application/json': function () {
        res.redirect('/atlassian-connect.json');
      }
    });
  });



  // Add any additional route handlers you need for views or REST resources here...
  app.get('/word-count', addon.authenticate(), function (req, res) {

    //  Get the ACE HTTP Client which interfaces with our Confluence instance.
    var httpClient = addon.httpClient(req);
    var contentId = req.query['contentId'];
    console.log(contentId)
    //  Using the client, check if the page we are currently viewing has a
    //  content property with a key of 'approvals'. 
    //  We use the /rest/api/content/{contentId}/property/{key} endpoint here.

    var text = " page is doing.)Tutorial the second one I need to get started with is a step - by - step guide on how to develop the project and its components.I 'll be going over a number of resources: Introduction to Python 3.6 .6(using Maven):Download and place an index.html file in the index folder of your project.In your.html, copy the code that has been updated to the correct location. (using Maven): Download and place an index.html file in the folder that contain the Python 3.7 Python compiler project, along with an installation guide.The Python file was updated to Python 2.7 .9. ";

    var groupBy = function (xs, key) {
      return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };


    str1 = text.replace(/(^\s*)|(\s*$)/gi, "");
    str1 = str1.replace(/[ ]{2,}/gi, " ");
    str1.replace(/\n /, "\n");

    var stringArray = str1.split(/(\s+)/);
    var groupBy_length = groupBy(stringArray, 'length');

    console.log(groupBy_length);




    httpClient.get({
      url: '/rest/api/content/' + contentId + '/?expand=body.storage'
    }, function (err, response, obj) {

      obj = JSON.parse(obj);

      //console.log(obj.body);

      // remove html tags
      var regex = /(<([^>]+)>)/ig;
      var body = obj.body.storage.value;
      var html_free_text = body.replace(regex, "");
      // count chars
      var characters = html_free_text.length;
      // remove all except whitespace & count
      var whitespaces = html_free_text.replace(/\S/gm, "");
      whitespaces = whitespaces.length;

      //count words
      var words = 0;
      str = html_free_text.replace(/(^\s*)|(\s*$)/gi, "");
      str = str.replace(/[ ]{2,}/gi, " ");
      str.replace(/\n /, "\n");
      words = str.split(' ').length;


      var avgWord = 0.01;
      avgWord = characters / words;
      avgWord = Number(avgWord).toFixed(1);

      //  Render.
      return res.render('word-count', {
        countedWords: words,
        countedChars: characters,
        avgWordLength: avgWord,
        countedWhitespace: whitespaces
      });

    });
  });

  // load any additional files you have in routes and apply those to the app
  {
    var fs = require('fs');
    var path = require('path');
    var files = fs.readdirSync("routes");
    for (var index in files) {
      var file = files[index];
      if (file === "index.js") continue;
      // skip non-javascript files
      if (path.extname(file) != ".js") continue;

      var routes = require("./" + path.basename(file));

      if (typeof routes === "function") {
        routes(app, addon);
      }
    }
  }
};