'use strict'

const omdbDataParser = ( body, inputType ) => {
  if ( body === undefined || null || '' ) {
    console.error( 'Body is undefined' );
  }

  // Show the request for the omdb api.
  let rawMovieCharacters = body.data.movies[0].actors;
  var movieCharacters = [];

  if ( rawMovieCharacters !== undefined || null || '' ) {
    movieCharacters = createOMDBCharcArr( movieCharacters, rawMovieCharacters, inputType );
  } else {
    console.error('Error: Connected to myfilmapi, but no actor data returned');
  }

  //Returns an array of movie characters with gender data
  return movieCharacters;
}

const createOMDBCharcArr = ( arr, rawMovieCharacters, inputType ) =>  {

  //Save character/actor & actress data to the movieCharacters array
  let charObj;
  for (var i = 0; i < rawMovieCharacters.length; i++) {

    let characterNameFormatted = rawMovieCharacters[i].character.replace(/'([^']+(?='))'/g, '$1').toUpperCase();

    //If a char is missing biography info - skip this character
    if (
      characterNameFormatted !== '' ||
      characterNameFormatted !== undefined ||
      characterNameFormatted !== null ||
      'biography' in rawMovieCharacters[i]
      ) {
      if ( inputType === 'fullCast') {
        var castType = true;
      } else {
        castType = false
      }
      arr.push({
          'actorName' : rawMovieCharacters[i].actorName,
          'gender' : rawMovieCharacters[i].biography.actorActress,
          'characterName' : characterNameFormatted,
          'mainCast' : castType
        });
    }
  }
  return arr;
}

module.exports = omdbDataParser;