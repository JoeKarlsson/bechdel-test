/* jshint esversion: 6 */
'use strict';

const Promise = require('bluebird');
const script  = require('./script');
const film    = require('./film');
let bechdelScore                  = 0;
let numScenesPass                 = 0;
let numScenesDontPass             = 0;
let numOfFemalesChars             = 0;
let numOfMaleChars                = 0;
let numOfFemalesCharsWithDialogue = 0;
let numOfMaleCharsWithDialogue    = 0;
let totalLinesFemaleDialogue      = 0;
let totalLinesMaleDialogue        = 0;
let scenesThatPass                = [];

/**
 * Returns an object with all of the characters in the movie and
 * the number times they talk in a given scene
 * @param  [Array] a array of movie characters
 * @param  [String] s This is a script that will be checked
 * it we be checked on a scene by scene basis and the script in it's entirity.
 * @return [object] an object with all of the characters in
 * the movie and the number times they talk in a given scene
 */
let countCharacterDialouge = (arr, scene) => {
  // console.log(a,s, 'countCharacterDialouge')
  if (!arr) {
    throw new Error('Invalid countCharacterDialouge input');
  }
  let x;
  let i;
  let output = {};

  for (x = 0; x < arr.length; x++) {
    i = 0;
    output[arr[x].characterName] = 0;
    while ((i = scene.indexOf(arr[x].characterName, i)) > -1) {
      output[arr[x].characterName]++;
      i++;
    }
  }
  return output;
};

/**
 * Returns a boolean depending on whether or not a char is female or not
 * @param  {[type]}  characters [description]
 * @return {Boolean} [description]
 */
const isCharFemale = (characters, name) => {
  if (!characters || !name) {
    throw new Error('Invalid isCharFemale input');
  }
  let idx;

  for (idx in characters) {
    let character = characters[idx];
    if (name === character.characterName) {
      if (character.gender === 'Actress') {
        return true;
      } else if (character.gender === 'Actor') {
        return false;
      } else {
        return false;
      }
    }
  }
  throw new Error('Character not found');
};

/**
 * Function to collect gender statistics based on the entire movie script.
 * Collects information on  numOfFemalesChars, numOfMaleChars,
 * numOfFemalesCharsWithDialogue, numOfMaleCharsWithDialogue,
 * totalLinesFemaleDialogue, and the totalLinesMaleDialogue.
 * @param  {[type]} characters [description]
 * @param  {[type]} movieScript     [description]
 * @return {[type]}                 [description]
 */
let scriptGenderAnalytics = (characters, movieScript) => {
  if (!characters || !movieScript) {
    throw new Error('Invalid scriptGenderAnalytics input');
  }
  let count = countCharacterDialouge(characters, movieScript);
  let name;

  for (name in count) {
    if (isCharFemale(characters, name)) {
      numOfFemalesChars++;
      if (count[name] > 0) {
        numOfFemalesCharsWithDialogue++;
        totalLinesFemaleDialogue += count[name];
      }
    } else {
      numOfMaleChars++;
      if (count[name] > 0) {
        numOfMaleCharsWithDialogue++;
        totalLinesMaleDialogue += count[name];
      }
    }
  }
};

const extractScenes = (characters, movieScript) =>  {
  return new Promise( (resolve, reject) => {
    if (!movieScript || !characters) {
      reject(new Error(
        'Failed when extracting scenes -' +
        ' Script has to yet been loaded into memory'
      ));
    }
    let idx;
    let scenes = [];
    let subScene = '';
    let keywords =  [
      'EXT',
      'INT',
      'EXTERIOR',
      'INTERIOR',
      'INT/EXT',
      'I/E'
    ];

    scriptGenderAnalytics(characters, movieScript);
    movieScript.split('\n').forEach( (pg) => {
      for (idx in keywords) {
        let keyword = keywords[idx];
        if (pg.indexOf(keyword) !== -1) {
          scenes.push(subScene);
          subScene = '';
          break;
        }
      }
      subScene += (pg + '\n');
    });
    scenes.push(subScene);
    resolve(scenes);
  });
};

const updateScore = (n) => {
  if (!n) {
    throw new Error('Invalid updateScore input');
  }
  if (n > bechdelScore) {
    bechdelScore = n;
    return bechdelScore;
  }
};

/**
 * Scans a scene for a list of patriachal keywords,
 * if one of these keywords is found in the scene, it returns true.
 * @param  {[type]} s [description]
 * @return {[boolean]}   Boolean indicating whether or not a scene
 * contains patriarchal keywords or not.
 */
const containsPatriarchalKeywords = (s) => {
  if (!s) {
    throw new Error('Invalid containsPatriarchalKeywords input');
  }
  const patriacryKeywords = [
    'Man',
    'Men',
    'Boy',
    'Boys',
    'Guy',
    'Guys',
    'Male',
    'Males',
    'Dude',
    'Dudes',
    'He',
    'His',
    'Him',
    'Husband',
    'Husbands',
    'Boyfriend',
    'Boyfriends',
    'Father',
    'Fathers',
    'Dad',
    'Dads',
    'Brother',
    'Brothers',
    'Son',
    'Sons',
    'bro',
    'bros',
    'Bro',
    'Bros',
    'King',
    'Kings',
    'Prince',
    'Princes'
  ];
  let keywordHits = 0;
  let x;
  let i;
  let output = {};

  for (x = 0; x < patriacryKeywords.length; x++) {
    i = 0;
    output[patriacryKeywords[x]] = 0;
    while ((i = s.indexOf(patriacryKeywords[x], i)) > -1) {
      output[patriacryKeywords[x]]++;
      i++;
      keywordHits++;
    }
  }
  if (keywordHits > 0) {
    return true;
  }
  return false;
};

/**
 * twoOrMoreFemalesInScene Determines is a scene
 * includes two or more female characters in it.
 * This function does not determine if these
 * women have a conversation or if they talk about men.
 * @param  {[type]} count An object containing the list
 * of all movie charachters and the number of times
 * they talk in a given scene.
 * @return {[Boolean]}   Returns a boolean depending
 * on whether or not a scene has two or more women in it.
 */
const twoOrMoreFemalesInScene = (characters, count) => {
  if (!characters || !count) {
    throw new Error('Invalid twoOrMoreFemalesInScene input');
  }
  let femalesWithDialogue = 0;
  let name;

  for (name in count) {
    if (count[name]) {
      if (isCharFemale(characters, name)) {
        femalesWithDialogue++;
      }
    }
  }
  if (femalesWithDialogue) {
    return true;
  }
};

/**
 * [bechdelTestPass description]
 * @param  {[type]} characters [description]
 * @param  {[type]} count [description]
 * @return {[type]} [description]
 */
const bechdelTestPass = (characters, count, scene) => {
  if (!characters || !count || !scene) {
    throw new Error('Invalid bechdelTestPass input');
  }
  if (twoOrMoreFemalesInScene(characters, count) === true ) {
    updateScore(2);
    if (containsPatriarchalKeywords(scene) === false) {
      numScenesPass++;
      updateScore(3);
      return true;
    }
    numScenesDontPass++;
    updateScore(2);
    return false;
  }
  numScenesDontPass++;
  updateScore(1);
  return false;
};

const sceneAnalysis = (characters, scenes) => {
  return new Promise((resolve, reject) => {
    if (!characters || !scenes) {
      reject(new Error('Invalid sceneAnalysis input'));
    }
    let bechdelPass = false;
    let bechdelResults = {};
    let idx;
    let scene;
    let count;

    for (idx in scenes) {
      scene = scenes[idx];
      count = countCharacterDialouge(characters, scene);
      if (bechdelTestPass(characters, count, scene) === true) {
        bechdelPass = true;
        scenesThatPass.push(scene);
      }
    }
    bechdelResults = {
      pass                          : bechdelPass,
      bechdelScore                  : bechdelScore,
      numScenesPass                 : numScenesPass,
      numScenesDontPass             : numScenesDontPass,
      numOfFemalesChars             : numOfFemalesChars,
      numOfMaleChars                : numOfMaleChars,
      numOfFemalesCharsWithDialogue : numOfFemalesCharsWithDialogue,
      numOfMaleCharsWithDialogue    : numOfMaleCharsWithDialogue,
      totalLinesFemaleDialogue      : totalLinesFemaleDialogue,
      totalLinesMaleDialogue        : totalLinesMaleDialogue,
      scenesThatPass                : scenesThatPass
    };
    resolve(bechdelResults);
  });
};

module.exports.getBechdelResults = (title, path) => {
  if (!title || !path) {
    throw new Error('Invalid getBechdelResults input');
  }
  let movieChar;

  return film.getData( title )
    .then( (characters) => {
      movieChar = characters;
      return script.read(path);
    })
    .then( ( movieScript ) => {
      return extractScenes( movieChar, movieScript );
    })
    .then( ( scenes ) => {
      return sceneAnalysis( movieChar, scenes );
    })
    .catch(function (error) {
      throw new Error(error);
    });
};

