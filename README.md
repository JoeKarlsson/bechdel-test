#Bechdel Test Movie Script Parser

##The Bechdel Test, sometimes called the Mo Movie Measure or Bechdel Rule is a simple test which names the following three criteria:

1. It includes at least two women
2. who have at least one conversation
3. about something other than a man or men.

The test was popularized by Alison Bechdel's comic Dykes to Watch Out For, in a 1985 strip called The Rule. For a nice video introduction to the subject please check out The Bechdel Test for Women in Movies on feministfrequency.com.

![Beschell Test]
(http://www.mestudios.com/wp-content/uploads/2014/12/Bechdel-the-rule.jpg)

This program accepts a movie script and analzes whether or not it passes the Beschel Test, as well as analyzing several other feminist components to a film. It can answer questions like "How many females are in this film," "By what factor does this pass the Bechel Test?"

##Usage
1. Intall node.js https://nodejs.org/en/
2. Git Clone/Fork project
3. cd beschel-test
4. run 'npm Install'

This will install the node and npm executables onto your system and have you ready to use Node.

5. run 'npm start' or 'DEBUG=myapp:* npm start' if you want to test the app
6. Open your browser window to 'http://localhost:3000/'
7. Input a movie script .txt movie script and see if the film passes the Beschel Test

##Updating Code from GitHub
1. Navigate to the beschel-test directory in terminal ('cd Desktop/beschel-test')
2. If you don't care about any local changes and just want a copy from the repo:

- git reset --hard HEAD
- git clean -f
- git pull

Again, this will nuke any changes you've made locally so use carefully.

##Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

##Credits
- Joe Carlson
- Laurel Carlson

##built with
- Express
- Node 5.1.0
- ES6
- SCSS - Foundation
- D3.js

##Node Modules used
- path
- serve-favicon
- morgan //HTTP request logger
- cookieParser //Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
- bodyParser //Node.js body parsing middleware
- fs //node tool for reading and writing from the file system
- Q //A tool for creating and composing asynchronous promises

##Notes about parsing movie scripts
When a character speaks, his or her name is capitalized and centered on the page. The character’s dialogue generally appears one line below. As we discuss below, there are variations within this general format that create parsing challenges.

##Todo
- Parse movie scripts (.txt or .html)
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
- http://www.imsdb.com/scripts/American-Hustle.html
- http://www.omdbapi.com/
- http://www.digitalhumanities.org/dhq/vol/8/4/000190/000190.html

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