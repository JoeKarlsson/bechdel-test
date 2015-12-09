var Q = require('q'); //A tool for creating and composing asynchronous promises

//@TODO
//Average keyword hits per scene
//Num of scenes that pass the test
//Num of female characters
//male v female

module.exports.extractScenes = function(movieScript) {
  return Q.promise(function (resolve, reject) {
    console.log('Breaking up scenes...');

    if (movieScript == '') {
      reject('Script has to yet been loaded into memory');
    }

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

    movieScript.split('\n').forEach(function(pg) {
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
 * Returns an object with all of the characters in the movie and the number times they talk in a given scene
 * @param  [Array] a array of movie characters
 * @param  [String] s This is a script that will be checked - it we be checked on a scene by scene basis and the script in it's entirity.
 * @return [object] an object with all of the characters in the movie and the number times they talk in a given scene
 */
function countCharacterDialouge(a, s) {

  if (s === '' || undefined || null) {
    console.error('Invalid Movie Script');
  }

  var x, i, output = {};
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

module.exports.sceneAnalysis = function(movieCharacters, sceneArray) {
  return Q.promise(function (resolve, reject) {
    var beschelPass = false;

    console.log('Scanning scenes for character names...');
    for ( var idx in sceneArray ) {
      var scene = sceneArray[idx]

      var count = countCharacterDialouge(movieCharacters, scene);
      if (beschelTestPass(movieCharacters, count, scene) === true ) {
        console.log('This scene passes the Beschel Test');
        beschelPass = true;
        console.log(scene);
      }

    }
    if (beschelPass === true) {
      console.log('This movie passes the Beschel Test');
    } else {
      console.log('This movie does NOT pass the Beschel Test');
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
function beschelTestPass (movieCharacters, count, scene) {

  if (twoOrMoreFemalesInScene(movieCharacters, count) === true ) {
    if (containsPatriarchalKeywords(scene) === false) {
      // Passes the Beschel Test
      return true;
    }

    // Contains dialouge about men - fails the beschel test
    return false
  }

  // This scene does not have 2 or more females with dialogue.
  return false

}

function containsPatriarchalKeywords(s) {

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
      'Bros'
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
 */
function twoOrMoreFemalesInScene(movieCharacters, count) {

  var femalesWithDialogue = 0;

  for (var name in count) {
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
function isCharFemale (movieCharacters, name) {
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