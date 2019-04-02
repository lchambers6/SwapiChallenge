"use strict";

// Node package for interactive CLI
var inquirer = require("inquirer");
// Node package for http requests
const request = require("request");
const planetUrl = "https://swapi.co/api/planets/?page=";
const peopleUrl = "https://swapi.co/api/people/?page=";
let planetArray = [];
let peopleArray = [];
let counter = 1;
let combinedArray = [];
let cleanCombined = [];
let cleanPlanets = [];
let cleanPeople = [];

console.log(
  "Please wait while the data comes back from a 'Galaxy Far, Far Away...'"
);
// Function to fill all the planet and people data and initiate building the objects
getPlanets(planetUrl, counter, resp => {
  planetArray = resp;
  getPeople(peopleUrl, counter, resp => {
    peopleArray = resp;
    combineArrays(planetArray, peopleArray, resp => {
      combinedArray = resp;
      cleanObjs(planetArray, peopleArray, combinedArray, () => prompt());
    });
  });
});

// Creates prompts for user and handles input commands
function prompt() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "command",
        message:
          "Enter Command (ex: 'people', 'planets', 'homes', 'find [planet]', 'exit')"
      }
    ])
    .then(function(val) {
      let command = val.command.split(" ");
      switch (command[0]) {
        case "find":
          console.log(findPlanet(command[1], cleanCombined));
          prompt();
          break;
        case "planets":
          console.log(cleanPlanets);
          prompt();
          break;
        case "people":
          console.log(cleanPeople);
          prompt();
          break;
        case "homes":
          console.log(cleanCombined);
          prompt();
          break;
        case "exit":
          console.log("May the Force be with you");
          break;
        default:
          console.log(
            "Acceptable commands include: 'people', 'planets', 'homes', 'find [planet]', 'exit'"
          );
          prompt();
      }
    });
}

// Returns a list of people from the planet provided as an arguement
function findPlanet(planet, cleanCombined) {
  for (let element of cleanCombined) {
    if (element.planet.toLowerCase() === planet.toLowerCase()) {
      if (element.people.length === 0) {
        return "No famous people from this plant";
      }
      return element.people;
    }
  }
  return "Try planets in this universe";
}

// Gets all the planet data from SWAPI and concatenates the paged data into a single object called planetArray
function getPlanets(planetUrl, counter, callback) {
  request(planetUrl + counter, function(err, res, body) {
    if (err) {
      reject(err);
    } else {
      if (JSON.parse(body).next !== null) {
        getPlanets(planetUrl, (counter += 1), planetArray => {
          callback(planetArray.concat(JSON.parse(body).results));
        });
      } else {
        callback(planetArray);
      }
    }
  });
}

// Gets all the people data from SWAPI and concatenates the paged data into a single object called peopleArray
function getPeople(peopleUrl, counter, callback) {
  request(peopleUrl + counter, function(err, res, body) {
    if (err) {
      reject(err);
    } else {
      if (JSON.parse(body).next !== null) {
        getPeople(peopleUrl, (counter += 1), peopleArray => {
          callback(peopleArray.concat(JSON.parse(body).results));
        });
      } else {
        callback(peopleArray);
      }
    }
  });
}

// Combines the planetArray and peopleArray into an object that shows all the people that are from each respective planet
function combineArrays(planetArray, peopleArray, callback) {
  for (let row of planetArray) {
    combinedArray.push({ planet: row.name, url: row.url, people: [] });
  }
  for (let row of peopleArray) {
    combinedArray.forEach(function(element, i) {
      if (element.url === row.homeworld) {
        combinedArray[i].people.push(row.name);
      }
    });
  }
  callback(combinedArray);
}

// Cleans the objects to make the more presentable to the user
function cleanObjs(planetArray, peopleArray, combinedArray, callback) {
  for (let i = 0; i < planetArray.length; i++) {
    cleanPlanets.push(planetArray[i].name);
    cleanCombined.push({
      planet: combinedArray[i].planet,
      people: combinedArray[i].people
    });
  }
  for (let i = 0; i < peopleArray.length; i++) {
    cleanPeople.push(peopleArray[i].name);
  }
  callback();
}
