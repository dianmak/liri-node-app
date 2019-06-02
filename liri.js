require("dotenv").config();
const keys = require("./keys.js");

// Include required npm packages
const moment = require("moment");
const axios = require("axios");
const Spotify = require("node-spotify-api");
const fs = require("fs");

// Store command line arguments
let command = process.argv[2];
let subject = process.argv[3];

// If commands are to be loaded from random.txt
if (command === "do-what-it-says") {
    doWhatItSays();
}
// else, use command from command line
else run(command, subject);

// Function to read random.txt and get the 
function doWhatItSays() {
    let input;
    fs.readFile("random.txt", "utf8", function (err, data) {
        if (err) throw err;
        console.log("data: " + data);
        input = data.split(",");
        console.log(input);

        command = input[0];
        subject = input[1];

        if (subject != undefined) {
            // Method for removing quotes learned from https://stackoverflow.com/questions/19156148/i-want-to-remove-double-quotes-from-a-string/43220059
            subject = subject.replace(/['"]+/g, '');
        }

        console.log("command " + command);
        console.log("subject " + subject);

        //run switch statement with the command and subject taken from random.txt
        run(command, subject);
    })
}

// if subject is defined, keep concatenating the argv values with spaces in between until we have the complete subject
if (subject != undefined) {
    for (let i = 4; i < process.argv.length; i++) {
        subject = subject.concat(" " + process.argv[i]);
    }
}

function run(command, subject) {
    switch (command) {
        // When the user wants to search a song
        case "spotify-this-song":
            let spotify = new Spotify(keys.spotify);

            if (subject === undefined) {
                console.log("Subject is undefined. Assigning default query.");
                subject = "The Sign Ace of Base";
            }

            spotify.search({ type: "track", query: subject })
                .then(function (data) {

                    let song = data.tracks.items[0];

                    console.log(`Artist: ${song.artists[0].name}`);
                    console.log(`Song Title: ${song.name}`);
                    console.log(`Preview Link: ${song.preview_url}`);
                    console.log(`Album: ${song.album.name}`);
                })

                .catch(function (err) {
                    console.log("Error occurred: " + err);
                })

            break;

        //When the user wants to search for a band or artist's shows
        case "concert-this":
            axios.get("https://rest.bandsintown.com/artists/" + subject + "/events?app_id=codingbootcamp").then(function (data) {
                for (let i = 0; i < data.data.length; i++) {
                    console.log(`Event ${i + 1}`);
                    console.log(`Venue: ${data.data[i].venue.name}`);
                    console.log(`Location: ${data.data[i].venue.city}, ${data.data[i].venue.region}, ${data.data[i].venue.country}`);
                    console.log(`Date: ${moment(data.data[i].datetime).format("MM/DD/YYYY")}`);
                    console.log("\n");
                }
            })
            break;

        //When the user wants to search a movie
        case "movie-this":
            if (subject === undefined) {
                console.log("Subject is undefined. Assigning default query.");
                subject = "Mr. Nobody";
            }

            axios.get("http://www.omdbapi.com/?apikey=trilogy&t=" + subject + "&type=movie").then(
                function (data) {
                    console.log(`Title: ${data.data.Title}`);
                    console.log(`Released: ${data.data.Year}`);
                    console.log(`IMDB Rating: ${data.data.Rated}`);
                    console.log(`Rotten Tomatoes Rating: ${data.data.Ratings[1].Value}`)
                    console.log(`Produced In: ${data.data.Country}`);
                    console.log(`Language: ${data.data.Language}`);
                    console.log(`Plot: ${data.data.Plot}`);
                    console.log(`Actors: ${data.data.Actors}`);
                }
            );
            break;

    }
}