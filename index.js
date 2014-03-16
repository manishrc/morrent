#!/usr/bin/env node

var
  inquirer        = require("inquirer"),
  request         = require("request"),
  _               = require('lodash'),
  updateNotifier  = require('update-notifier'),
  nopt            = require("nopt"),
  notifier        = updateNotifier(),
  querystring     = require("querystring"),
  shell         = require('shelljs'),
  knownOpts       = { "hd" : Boolean, "sd" : Boolean, "3d" : Boolean, "help" : Boolean},
  parsedOpts      = nopt(knownOpts);


if (parsedOpts["help"]) {
  shell.echo("USAGE: morrent <movie name> [options]\n");
  shell.echo("OPTIONS: \n\t--hd\tPlays 1080p\n\t--sd\tPlays 720p\n\t--3d\tPlays 3D");
  process.kill();
};

if (notifier.update) {
    notifier.notify('Update available: ' + notifier.update.latest);
}

var api_url = function(){
  var
    base_url  = "http://yts.re/api/list.json?",
    options   = {
              "keywords": parsedOpts["argv"]["remain"].join('+'),
              "limit": 5,
              "sort": "seeds"
            };

  if(parsedOpts["hd"] == true){
    options["quality"] = "1080p";
  }
  if(parsedOpts["sd"] == true){
    options["quality"] = "720p";
  }
  if(parsedOpts["3d"] == true){
    options["quality"] = "3d";
  }
  return base_url+querystring.stringify(options);
}

request(api_url(), function(error, response, body){
  var
    json        = JSON.parse(body),
    movie_list  = json["MovieList"],
    movie_names = _.pluck(movie_list,"MovieTitle");

  inquirer.prompt({
    "type"    : "list",
    "name"    : "movie",
    "message" : "Choose one to start playing:",
    "choices" : movie_names
    } ,function( choice ) {
        movie  =  _.find(movie_list, function(mv){
        return mv.MovieTitle == choice["movie"];
      });
      shell.echo("The Video will start playing in a while.");
      shell.exec("peerflix "+movie["TorrentUrl"]+" --vlc");
  });
});