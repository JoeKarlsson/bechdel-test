'use strict'

const Q = require('q');

let bechdelScore = 0;
let numScenesPass = 0;
let numScenesDontPass = 0;
let numOfFemalesChars = 0;
let numOfMaleChars = 0;
let numOfFemalesCharsWithDialogue = 0;
let numOfMaleCharsWithDialogue = 0;
let totalLinesFemaleDialogue = 0;
let totalLinesMaleDialogue = 0;

module.exports.extractScenes = ( movieCharacters, movieScript ) =>  {

  return Q.promise( (resolve, reject) => {
    console.log('Breaking up movie script by scene...');

    if (movieScript == '') {
      reject('Script has to yet been loaded into memory');
    }

    scriptGenderAnalytics(movieCharacters, movieScript);

    var result = [];
    var subScene = '';
    var sceneArray = [];
    var keywords =  [
      'EXT',
      'INT',
      'EXTERIOR',
      'INTERIOR',
      'INT/EXT',
      'I/E'
    ];

    movieScript.split('\n').forEach( (pg) => {
      for (var idx in keywords) {
        var keyword = keywords[idx];

        if (pg.indexOf(keyword) != -1) {
          sceneArray.push(subScene);
          subScene = '';
          break;
        }
      }
      subScene += (pg + '\n');
    });
    sceneArray.push(subScene);

    console.log('Scenes extracted from script')
    resolve(sceneArray);
  })
}

/**
 * Function to collect gender statistics based on the entire movie script. Collects information on  numOfFemalesChars, numOfMaleChars, numOfFemalesCharsWithDialogue, numOfMaleCharsWithDialogue, totalLinesFemaleDialogue, and the totalLinesMaleDialogue.
 * @param  {[type]} movieCharacters [description]
 * @param  {[type]} movieScript     [description]
 * @return {[type]}                 [description]
 */
let scriptGenderAnalytics = ( movieCharacters, movieScript ) => {
  var count = countCharacterDialouge( movieCharacters, movieScript );

  for (var name in count ) {
    if ( isCharFemale( movieCharacters, name ) ){
      numOfFemalesChars++;
      if ( count[name] > 0 ) {
        numOfFemalesCharsWithDialogue++;
        totalLinesFemaleDialogue += count[name];
      }
    } else {
      numOfMaleChars++
      if ( count[name] > 0 ) {
        numOfMaleCharsWithDialogue++;
        totalLinesMaleDialogue += count[name];
      }
    }
  }
}

/**
 * Returns an object with all of the characters in the movie and the number times they talk in a given scene
 * @param  [Array] a array of movie characters
 * @param  [String] s This is a script that will be checked - it we be checked on a scene by scene basis and the script in it's entirity.
 * @return [object] an object with all of the characters in the movie and the number times they talk in a given scene
 */
let countCharacterDialouge = ( a, s ) => {

  if (s === '' || undefined || null) {
    throw new Error( 'Invalid Movie Script' )
  }

  let x, i, output = {};
  for (x = 0; x < a.length; x++) {
    i = 0;

    output[a[x].characterName] = 0;
    while ((i = s.indexOf(a[x].characterName, i)) > -1) {
      output[a[x].characterName]++;
      i++
    }
  }
  return output;
}

module.exports.sceneAnalysis = ( movieCharacters, sceneArray ) => {
  return Q.promise( (resolve, reject) => {
    let beschelPass = false;

    console.log( 'Checking to see if this film passes the Bechdel Test...' );
    for ( let idx in sceneArray ) {
      let scene = sceneArray[idx]
      // console.log(scene);

      var count = countCharacterDialouge( movieCharacters, scene) ;
      if ( beschelTestPass( movieCharacters, count, scene ) === true ) {
        console.log( 'This scene passes the Bechdel Test' );
        beschelPass = true;
        console.log( scene );
      }

    }

    console.log('Number of female characters: ' + numOfFemalesChars);
    console.log('Number of male characters: ' + numOfMaleChars);
    console.log('Number of female characters w dialogue: ' +numOfFemalesCharsWithDialogue);
    console.log('Number of male characters w dialogue: ' + numOfMaleCharsWithDialogue);
    console.log('Total lines of female dialogue: ' + totalLinesFemaleDialogue);
    console.log('Total lines of male dialogue: ' + totalLinesMaleDialogue);
    console.log('Number of scenes that pass the Bechdel Test: ' + numScenesPass);
    console.log('Number of scenes that dont pass the Bechdel Test: ' + numScenesDontPass);

    console.log('Bechdel Score: ' + bechdelScore);
    if (beschelPass === true) {
      console.log('This movie passes the Bechdel Test');
    } else {
      console.log('This movie does NOT pass the Bechdel Test');
    }

    resolve( count );
  })

}

/**
 * [beschelTestPass description]
 * @param  {[type]} movieCharacters [description]
 * @param  {[type]} count           [description]
 * @param  {[type]} scene           [description]
 * @return {[type]}                 [description]
 */
let beschelTestPass = ( movieCharacters, count, scene ) => {

  if ( twoOrMoreFemalesInScene( movieCharacters, count ) === true ) {
    updateScore( 2 );
    if (containsPatriarchalKeywords(scene) === false) {
      // Passes the Beschel Test
      numScenesPass++;
      updateScore(3);
      return true;
    }

    // Contains dialouge about men - fails the beschel test
    updateScore(2);
    numScenesDontPass++;
    return false;
  }

  // This scene does not have 2 or more females with dialogue.
  updateScore(1);
  numScenesDontPass++;
  return false;

}

/**
 * Updates the Bechdel Score based on on if the input score number is higher than it's previous value
 * @param  {[type]} number [description]
 * @return {[type]}        [description]
 */
let updateScore = (number) => {
  if ( number > bechdelScore ) {
    bechdelScore = number;
    return bechdelScore
  }
}

/**
 * Scans a scene for a list of patriachal keywords, if one of these keywords is found in the scene, it returns true.
 * @param  {[type]} s [description]
 * @return {[boolean]}   Boolean indicating whether or not a scene contains patriarchal keywords or not.
 */
let containsPatriarchalKeywords = (s) => {

  var patriacryKeywords = [
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
  ]

  if (s === '' || undefined || null) {
    console.error('Invalid scene input');
  }
  var keywordHits = 0;
  var x, i, output = {};
  for (x = 0; x < patriacryKeywords.length; x++) {
    i = 0;

    output[patriacryKeywords[x]] = 0;
    while ((i = s.indexOf(patriacryKeywords[x], i)) > -1) {
      output[patriacryKeywords[x]]++;
      i++
      keywordHits++;
    }
  }

  if (keywordHits > 0) {
    return true
  }

  // console.log(output);
  return false;
}

/**
 * twoOrMoreFemalesInScene Determines is a scene includes two or more female characters in it. This function does not determine if these women have a conversation or if they talk about men.
 * @param  {[type]} count An object containing the list of all movie charachters and the number of times they talk in a given scene.
 * @return {[Boolean]}       Returns a boolean depending on whether or not a scene has two or more women in it.
 *
 */
let twoOrMoreFemalesInScene = (movieCharacters, count) => {

  var femalesWithDialogue = 0;

  for (let name in count) {
    var linesOfDialogue = count[name];
    if (linesOfDialogue > 0) {
      if (isCharFemale(movieCharacters, name)) {
        femalesWithDialogue++;
      }
    }
  }

  if (femalesWithDialogue > 1) {
    return true;
  }
}

/**
 * Returns a boolean depending on whether or not a char is female or not
 * @param  {[type]}  movieCharacters [description]
 * @param  {[type]}  name            [description]
 * @return {Boolean}                 [description]
 */
const isCharFemale = (movieCharacters, name) => {
  for (var idx in movieCharacters) {
    var character = movieCharacters[idx];
    if (name == character.characterName) {
      if (character.gender === 'Actress') {
        // console.log(character.characterName + ' is female');
        return true;
      } else if (character.gender === 'Actor') {
        // console.log(character.characterName + ' is male');
        return false;
      } else {
        // console.log(character.characterName + ' is undefined or other');
        return false;
      }
    }
  }
  console.error('Character not found');
}