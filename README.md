<p align="center">
	<img width=100% src="https://user-images.githubusercontent.com/4650739/34265870-eb4dc20c-e63c-11e7-8188-a4096ef24153.jpeg" />

</p>
<h1 align="center">bechdel.io</h1>
<h3 align="center">Find out if your favorite film passes the test</h3>

[![deps][deps]][deps-url]
[![Coverage Status][cover]][cover-url]
[![Build Status][tests]][tests-url]
[![Maintainability][maintainability]][maintainability-url]
[![stars][stars]][stars-url]
[![pr][pr]][pr-url]
[![license][license]][license-url]
[![twitter][twitter]][twitter-url]
[![bch compliance][bchcompliance]][bchcompliance-url]
[![first-timers-only](http://img.shields.io/badge/first--timers--only-friendly-blue.svg?style=flat-square)](http://www.firsttimersonly.com/)

## The Bechdel Test, sometimes called the Mo Movie Measure or Bechdel Rule is a simple test which names the following three criteria:

1. It includes at least two women
2. who have at least one conversation
3. about something other than a man or men.

The test was popularized by Alison Bechdel's comic Dykes to Watch Out For, in a 1985 strip called The Rule. For a nice video introduction to the subject please check out The Bechdel Test for Women in Movies on [feministfrequency.com](http://feministfrequency.com/).

This program accepts a movie script and analyzes whether or not it passes the Bechdel Test, as well as analyzing several other feminist components to a film. It can answer questions like "How many females are in this film," "By what factor does this pass the Bechdel Test?"

#### Prerequisites

* Install [Node.js](https://nodejs.org/en/)

## Quickstart:

### 1. Clone The Repository

```sh
git clone https://github.com/JoeKarlsson/bechdel-test
cd bechdel-test
```

### 2. Get API Keys For The MovieDB and My API Films

You will need to get API Keys for [The MovieDB](https://www.themoviedb.org/) and [My API Films](https://www.myapifilms.com/).

* You can sign up for an API key for The MovieDB, here: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).
  * Additional Documentation about this API can be found here: [https://developers.themoviedb.org/3/getting-started/introduction](https://developers.themoviedb.org/3/getting-started/introduction).
* You can sign up for an API key for My API Films, here: [https://www.myapifilms.com/token.do](https://www.myapifilms.com/token.do).
  * Additional Documentation about this API can be found here: [https://www.myapimovies.com/api/v1/swagger-ui.html](https://www.myapimovies.com/api/v1/swagger-ui.html).


### 3. Log on to Atlas

To use MongoDB Atlas, you must be logged into [Atlas](https://cloud.mongodb.com).

### 4. Create an Atlas Cluster

1. In the left navigation pane, click Clusters, and then click the Build New Cluster button. The Create New Cluster page opens.
2. Choose your preferred provider and region, tier, and additional settings. As you build your cluster, Atlas displays the associated costs at the bottom of the page.
3. The default cluster name is Cluster0. If you wish to change the name, do so now, as cluster names cannot be changed once configured.
4. Click the Create Cluster button to save your changes.

### 5. Configure Your Atlas Cluster

1. Go to Database Access and hit Add New User. Add a username and password, if you autogenerate a password make sure you copy it, we’ll need it later.
2. Go to Network Access, hit Add IP Address, and hit Add Current IP Address, then confirm.
3. Go to Clusters, if your cluster build is done then hit Connect, Connect Your Application, and copy the line of code it gives you

### 6. Connect Bechdel.io to MongoDB and the various other APIs

Change `src/server/config/config_example.json` to `src/server/config/config.json` and

* Paste your MongoDB URI into the `MONGODB_URI` feild.
* Paste your MovieDB API Key into the `THEMOVIEDB` feild.
* Paste your My API Films API Key into the `MYAPIFILMS` feild.

### 7. Install dependencies & run locally

```sh
npm install
npm start # open http://localhost:3000 in your browser
```

## Testing

The `bechdel.io` test suite is run with `npm test`.
You can [read more about testing bechdel.io](test).

## Where to Get Movie Scripts?

If you are looking to get your hands on some movie scripts to test, you can check out my CLI Movie Script Grabber [https://github.com/JoeKarlsson/movie-script-scraper](https://github.com/JoeKarlsson/movie-script-scraper)

## Introduction

The Bechdel Test Script Parser was a collaborative digital humanities project between myself and my sister, Laurel Karlsson. It is the product of a shared passion for film, feminism, and the creative potential of technology. By combining the talents and interests of myself, a software engineer, we’ve been able to create an innovative data mining tool for film analysis that we hope to continue to work on and improve. You can check out the project on our [website](https://bechdel-test.herokuapp.com/).

This project was born when my sister reached out to me for advice on a few ideas she had been mulling over for a digital humanities project. Hoping to do something related to feminist film analysis, she was feeling very limited by my lack of coding experience and hadn’t been able to find an existing data mining tool to accomplish what she was looking to do. I immediately offered up my coding expertise, looking to gain experience by building a tool from scratch which would accomplish the specific needs of the project. After brainstorming several different project ideas, we settled on the one you see here.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/JoeKarlsson/bechdel-test/blob/develop/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

### TLDR;

1. Fork it!
1. Create your feature branch: `git checkout -b my-new-feature`
1. Commit your changes: `git commit -am 'Add some feature'`
1. Push to the branch: `git push origin my-new-feature`
1. Submit a pull request :D

### Maintainers

<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150 height="150"
        src="https://avatars.githubusercontent.com/JoeKarlsson?v=3">
        <br />
        <a href="https://github.com/JoeKarlsson">Joe Karlsson</a>
      </td>
			<td align="center">
        <img width="150 height="150"
        src="https://avatars.githubusercontent.com/laurelcarlson?v=3">
        <br />
        <a href="https://github.com/laurelcarlson">Laurel Karlsson</a>
      </td>
    <tr>
  <tbody>
</table>

### License

#### [MIT](./LICENSE)

## Related Links

* [The Internet Movie Script Database (IMSDb)](http://www.imsdb.com/)
* [The Open Movie Database](http://www.omdbapi.com/)
* [Visualizing and Analyzing the Hollywood Screenplay with ScripThreads](http://www.digitalhumanities.org/dhq/vol/8/4/000190/000190.html)
* [Check out our Trello board for next steps](https://trello.com/b/Ldg9sYtf/bechdel-test)

### Resources

[deps]: https://david-dm.org/JoeKarlsson/bechdel-test/status.svg
[deps-url]: https://david-dm.org/JoeKarlsson/bechdel-test
[tests]: https://travis-ci.org/JoeKarlsson/bechdel-test.svg?branch=develop
[tests-url]: https://travis-ci.org/JoeKarlsson/bechdel-test
[maintainability]: https://api.codeclimate.com/v1/badges/7d2a095c01bb88557a41/maintainability
[maintainability-url]: https://codeclimate.com/github/JoeKarlsson/bechdel-test/maintainability
[pr]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[pr-url]: CONTRIBUTING.md
[cover]: https://coveralls.io/repos/github/JoeKarlsson/bechdel-test/badge.svg?branch=develop
[cover-url]: https://coveralls.io/github/JoeKarlsson/bechdel-test?branch=develop
[stars]: https://img.shields.io/github/stars/JoeKarlsson/bechdel-test.svg?style=flat-square
[stars-url]: https://github.com/JoeKarlsson/bechdel-test/stargazers
[license]: https://img.shields.io/github/license/JoeKarlsson/bechdel-test.svg
[license-url]: https://github.com/JoeKarlsson/bechdel-test/blob/develop/LICENSE
[twitter]: https://img.shields.io/twitter/url/https/github.com/JoeKarlsson/bechdel-test.svg?style=social&style=flat-square
[twitter-url]: https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2FJoeKarlsson%2Fbechdel-test
[greenkeeper]: https://badges.greenkeeper.io/JoeKarlsson/bechdel-test.svg
[greenkeeper-url]: https://greenkeeper.io/
[snyk]: https://snyk.io/test/github/joekarlsson/bechdel-test/badge.svg
[snyk-url]: https://snyk.io/test/github/joekarlsson/bechdel-test
[bchcompliance]: https://bettercodehub.com/edge/badge/JoeKarlsson/bechdel-test?branch=develop
[bchcompliance-url]: https://bettercodehub.com/
