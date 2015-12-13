#Bechdel Test Movie Script Parser

##The Bechdel Test, sometimes called the Mo Movie Measure or Bechdel Rule is a simple test which names the following three criteria:

1. It includes at least two women
2. who have at least one conversation
3. about something other than a man or men.

The test was popularized by Alison Bechdel's comic Dykes to Watch Out For, in a 1985 strip called The Rule. For a nice video introduction to the subject please check out The Bechdel Test for Women in Movies on [feministfrequency.com](http://feministfrequency.com/).

![Bechdel Test]
(http://www.mestudios.com/wp-content/uploads/2014/12/Bechdel-the-rule.jpg)

This program accepts a movie script and analzes whether or not it passes the Beschel Test, as well as analyzing several other feminist components to a film. It can answer questions like "How many females are in this film," "By what factor does this pass the Bechel Test?"

## How It Works
Of all narrative textual forms, the motion picture screenplay may be the most perfectly pre-disposed for computational analysis[Murtagh, Ganz, and Reddington 2011](http://www.digitalhumanities.org/dhq/vol/8/4/000190/000190.html). Screenplays contain capitalized character names, indented dialogue, and other formatting conventions that enable an algorithmic approach to analyzing and visualizing film narratives. Coupled with massive online movie data bases, we can parse through movie scripts and collect insights on a level not yet seen before[Hoyt, Ponto, Roy](http://www.digitalhumanities.org/dhq/vol/8/4/000190/000190.html). In this article, the authors introduce their new tool, Bechdel Test Visulizer, which parses screenplays, outputs statistical gender values which can be analyzed, and offers four different types of visualization, each with its own utility. In this analysis, the authors use the Bechdel Test Visualizer to analyze the 2014 Oscar Best Picture Nominees.

In the process of building this tool’s prototype, I have come to appreciate the many ways that a computer reads a screenplay differently from you or me. Humans gather insight from watching and experiencing the emotion, tension, and dynamics of a movie or screenplay. Rather than attempting to train a computer to understand a film in the exact same way I do, I would prefer to ask a computer to do tasks that it is designed to do well and that we humans struggle with. Humans have memory limitations when it comes to matters of sequential timing and the entrances and exits of dozens of characters. In contrast, computers are excellent at gathering and recording these sorts of details from structured texts. Lev Manovich has suggested that one of the most valuable things that comes from combining computational analysis and the visualization of vast amounts of information in a single image is that it defamiliarizes our understanding of the works that we study in the Humanities [Manovich 2012](https://sc.edu/about/centers/digital_humanities/future_knowledge_archive/manovich_videopage.php). As I hope to demonstrate, the Bechdel Test Visualizer is a powerful tool for defamiliarization, provoking new questions and gender and film, and producing new answers through the combined strengths of the human analyst and the computer.

## Parsing Method
The Bechdel Test Visualizer is web application built enirely using JavaScript and Node.js. This tool uses a combination of online databases manual script parsing in order to collect insights about a film.

First, the script finds the title of the film, this is generally on the first page, and for the prototype, it is requireed to be the first line of text in the txt file. Once the title of the film has been identified, I make an API call out to [myapifilms.com](http://api.myapifilms.com/imdb.do). From here, I can collect general information about the film, such as genre, release year, runtime, etc. But the most important information comes from collecting information about the actors and actresses in the film. Using this API, I can collect a list of all of the actors and actresses, their character's name in the film, and what gender they are. The character's gender is the most important bit of information I can collect, since it is essential when trying to determine if a scene passes the bechdel test or not.

Once all of the gender and film data has been collected via the API - I can begin analyzing the script. The first step is to break the script down into scenes in order to tell if two females shared a scene together. Scenes were determined by looking for a user defined set of keywords, such as "int." or "ext.". In practice, it was determined that a list of 10-12 keywords well captured scene changes.

In the scene, I collected dialogue by character by using simple parsing techinques. I was then able to test if two female character's shared a scene. If two or more females shared a scene together, I tested their dialogue by checking if their dialogue contained keywords that indictated that they were speaking about a men or men. This list included words like 'He', 'Him', 'Father', 'King', etc. This list is very basic, and after initial tests, I can see that this list needs additional work, as patriarchal words are very ingrained in the English Language, and judging context is very difficult for a computer to do. However, for the context of my experiments, this list has sufficed. This tool, however is very good at generating data on gender participation in films.

## Requirements
This uses [jspm](http://jspm.io/) as the browser package manager and [gulp](http://gulpjs.com/) for build automation during development so you should have these installed globally

##Usage
1. Intall [node.js](https://nodejs.org/en/)
2. ```npm install -g jspm```
3. ```npm install -g gulp```
4. Git Clone/Fork project
```git clone git@github.com:JoeKarlsson1/beschel-test.git```
5. ```cd beschel-test```
6. ```npm install```
This will install the node and npm executables onto your system and have you ready to use Node.
7. ```jspm install```
This will install the jspm dependencies.
5. ```gulp```
Starts web application
6. Open your browser window to [http://localhost:3000/](http://localhost:3000/)

##Updating Code from GitHub
1. Navigate to the beschel-test directory in terminal ```cd Desktop/beschel-test```
2. If you don't care about any local changes and just want a copy from the repo:

- ```git fetch --all```
- ```git pull```

Your code should now be up to date! ;)

##Contributing
1. Fork it!
2. Create your feature branch: ```git checkout -b my-new-feature```
3. Commit your changes: ```git commit -am 'Add some feature'```
4. Push to the branch: ````git push origin my-new-feature````
5. Submit a pull request :D

##Credits
- Joe Carlson
- Laurel Carlson

##Built with
- Express
- Node 5.1.0
- ES6
- SCSS - Foundation
- D3.js
- C3.js

##Dependencies
- body-parser
- errorhandler
- express
- jade
- lodash
- markdown-serve
- method-override
- moment
- morgan
- multer
- q
- serve-favicon
- winston

##Dev Dependencies
- browser-sync": "^2.8.0",
- chalk": "^1.1.0",
- dateformat": "^1.0.11",
- del": "^1.2.0",
- gulp": "^3.9.0",
- gulp-autoprefixer": "^2.3.1",
- gulp-cache": "^0.2.10",
- gulp-concat": "^2.6.0",
- gulp-header": "^1.2.2",
- gulp-jshint": "^1.11.2",
- gulp-load-plugins": "^1.0.0-rc",
- gulp-load-utils": "0.0.4",
- gulp-minify-css": "^1.2.0",
- gulp-nodemon": "^2.0.3",
- gulp-notify": "^2.2.0",
- gulp-sass": "^2.0.4",
- gulp-size": "^1.2.3",
- gulp-sourcemaps": "^1.5.2",
- gulp-tap": "^0.1.3",
- gulp-uglify": "^1.2.0",
- jshint-stylish": "^2.0.1",
- minimist": "^1.1.2",
- run-sequence": "^1.1.2"

##Notes about parsing movie scripts
When a character speaks, his or her name is capitalized and centered on the page. The character’s dialogue generally appears one line below. As we discuss below, there are variations within this general format that create parsing challenges.

##Todo
- Show data - Where and when they talk
- Score: How much of the movie contains dialogue that passes the test
- Breakdown:
    Male to male interactions
    male to female interactions
    female to female interactions
    Other
-Number of scenes with women v # w/ men
-Do directors tend to make movies that pass the Beschdal test?

##Related Links
- [The Internet Movie Script Database (IMSDb)](http://www.imsdb.com/)
- [The Open Movie Database](http://www.omdbapi.com/)
- [Visualizing and Analyzing the Hollywood Screenplay with ScripThreads](http://www.digitalhumanities.org/dhq/vol/8/4/000190/000190.html)
- [Check out our trello board for next steps](https://trello.com/b/Ldg9sYtf/bechdel-test)

##License
The MIT License (MIT)

Copyright (c) 2015 Joseph Carlson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.