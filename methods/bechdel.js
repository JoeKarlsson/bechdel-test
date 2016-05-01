'use strict'

const Q       = require('q');
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

module.exports.getBechdelResults = (title, path) => {
  let movieChar;

  return film.getData( title )
    .then( (characters) => {
      console.log('readScript')
      movieChar = characters;
      return script.read(path);
    })
    .then( ( movieScript ) => {
      console.log('Breaking up movie script by scene...');
      return extractScenes( movieChar, movieScript );
    })
    .then( ( sceneArray ) => {
      console.log('Scenes extracted from script')
      return sceneAnalysis( movieChar, sceneArray );
    })
    .catch(function (error) {
      throw new Error(error);
    })
}

const extractScenes = ( characters, movieScript ) =>  {
  return Q.promise( (resolve, reject) => {
    if (movieScript == '') {
      reject('Script has to yet been loaded into memory');
    }
    let result, sceneArray = [];
    let subScene = '';
    let keywords =  [
      'EXT',
      'INT',
      'EXTERIOR',
      'INTERIOR',
      'INT/EXT',
      'I/E'
    ];
    let idx;

    scriptGenderAnalytics(characters, movieScript);
    movieScript.split('\n').forEach( (pg) => {
      for (idx in keywords) {
        let keyword = keywords[idx];
        if (pg.indexOf(keyword) != -1) {
          sceneArray.push(subScene);
          subScene = '';
          break;
        }
      }
      subScene += (pg + '\n');
    });
    sceneArray.push(subScene);
    resolve(sceneArray);
  });
};

/**
 * Function to collect gender statistics based on the entire movie script. Collects information on  numOfFemalesChars, numOfMaleChars, numOfFemalesCharsWithDialogue, numOfMaleCharsWithDialogue, totalLinesFemaleDialogue, and the totalLinesMaleDialogue.
 * @param  {[type]} movieCharacters [description]
 * @param  {[type]} movieScript     [description]
 * @return {[type]}                 [description]
 */
let scriptGenderAnalytics = ( movieCharacters, movieScript ) => {
  let count = countCharacterDialouge( movieCharacters, movieScript );
  let name;

  for (name in count ) {
    if ( isCharFemale( movieCharacters, name ) ) {
      numOfFemalesChars++;
      if ( count[name] > 0 ) {
        numOfFemalesCharsWithDialogue++;
        totalLinesFemaleDialogue += count[name];
      };
    } else {
      numOfMaleChars++
      if ( count[name] > 0 ) {
        numOfMaleCharsWithDialogue++;
        totalLinesMaleDialogue += count[name];
      };
    };
  };
};

/**
 * Returns an object with all of the characters in the movie and the number times they talk in a given scene
 * @param  [Array] a array of movie characters
 * @param  [String] s This is a script that will be checked - it we be checked on a scene by scene basis and the script in it's entirity.
 * @return [object] an object with all of the characters in the movie and the number times they talk in a given scene
 */
let countCharacterDialouge = ( a, s ) => {
  if (s === '' || undefined || null) {
    throw new Error( 'Invalid Movie Script' )
  };
  let x, i, output = {};

  for (x = 0; x < a.length; x++) {
    i = 0;
    output[a[x].characterName] = 0;
    while ((i = s.indexOf(a[x].characterName, i)) > -1) {
      output[a[x].characterName]++;
      i++
    };
  };
  return output;
};

const sceneAnalysis = ( characters, sceneArray ) => {
  return Q.promise( (resolve, reject) => {
    let bechdelPass = false;
    let bechdelResults = {};
    let idx, scene, count;

    for ( idx in sceneArray ) {
      scene = sceneArray[idx];
      count = countCharacterDialouge( characters, scene);
      if ( bechdelTestPass( characters, count, scene ) === true ) {
        bechdelPass = true;
        scenesThatPass.push(scene)
      };
    };
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

/**
 * [bechdelTestPass description]
 * @param  {[type]} characters [description]
 * @param  {[type]} count           [description]
 * @return {[type]}                 [description]
 */
const bechdelTestPass = (characters, count, scene) => {
  if (twoOrMoreFemalesInScene(characters, count) === true ) {
    updateScore(2);
    if (containsPatriarchalKeywords(scene) === false) {
      numScenesPass++;
      updateScore(3);
      return true;
    };
    updateScore(2);
    numScenesDontPass++;
    return false;
  };
  updateScore(1);
  numScenesDontPass++;
  return false;
};

const updateScore = (n) => {
  if ( n > bechdelScore ) {
    bechdelScore = n;
    return bechdelScore
  };
};

/**
 * Scans a scene for a list of patriachal keywords, if one of these keywords is found in the scene, it returns true.
 * @param  {[type]} s [description]
 * @return {[boolean]}   Boolean indicating whether or not a scene contains patriarchal keywords or not.
 */
const containsPatriarchalKeywords = (s) => {
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
  if (s === '' || undefined || null) {
    throw new Error('Invalid scene input');
  };
  let keywordHits = 0;
  let x, i, output = {};
  for (x = 0; x < patriacryKeywords.length; x++) {
    i = 0;
    output[patriacryKeywords[x]] = 0;
    while ((i = s.indexOf(patriacryKeywords[x], i)) > -1) {
      output[patriacryKeywords[x]]++;
      i++
      keywordHits++;
    };
  };
  if (keywordHits > 0) {
    return true
  };
  return false;
};

/**
 * twoOrMoreFemalesInScene Determines is a scene includes two or more female characters in it. This function does not determine if these women have a conversation or if they talk about men.
 * @param  {[type]} count An object containing the list of all movie charachters and the number of times they talk in a given scene.
 * @return {[Boolean]}       Returns a boolean depending on whether or not a scene has two or more women in it.
 *
 */
const twoOrMoreFemalesInScene = (charcters, count) => {
  let femalesWithDialogue = 0;
  let name;

  for (name in count) {
    let linesOfDialogue = count[name];
    if (linesOfDialogue > 0) {
      if (isCharFemale(charcters, name)) {
        femalesWithDialogue++;
      };
    };
  };
  if (femalesWithDialogue > 1) {
    return true;
  };
};

/**
 * Returns a boolean depending on whether or not a char is female or not
 * @param  {[type]}  charcters [description]
 * @return {Boolean}                 [description]
 */
const isCharFemale = (charcters, name) => {
  let idx;

  for (idx in charcters) {
    let character = charcters[idx];
    if (name == character.characterName) {
      if (character.gender === 'Actress') {
        return true;
      } else if (character.gender === 'Actor') {
        return false;
      } else {
        return false;
      };
    };
  };
  throw new Error('Character not found');
};