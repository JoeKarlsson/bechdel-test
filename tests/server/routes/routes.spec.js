/*
  eslint
    no-unused-expressions: 0,
    func-names: 0,
    strict: 0
*/
/* eslint-env mocha, mongo */

const path = require("path");
const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const mongoose = require("mongoose");
const app = require("../../../server/server.js");

mongoose.models = {};
mongoose.modelSchemas = {};

describe("Film Routes Test", () => {
  let connection;
  let id;
  beforeEach(done => {
    connection = mongoose.createConnection("mongodb://localhost/bechdelTest");
    connection.once("open", () => {
      done();
    });
  });

  afterEach(done => {
    connection.close(() => {
      done();
    });
  });

  describe("GET /api/film", () => {
    it("should send JSON with an array of films", done => {
      request(app)
        .get("/api/film")
        .expect(200)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.be.an("array");
          return done();
        });
    });
  });

  describe("POST /api/film/ already in the database", () => {
    it("should return the film", function(done) {
      this.timeout(0);
      request(app)
        .post("/api/film/")
        .attach("script", path.join(__dirname, "test-script-2.txt"))
        .expect(200)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.include.keys("_id");
          expect(res.body._id).to.be.ok;
          expect(res.body._id).to.be.an("string");
          id = res.body._id;
          expect(res.body).to.be.an("object");
          expect(res.body).to.include.keys("title");
          expect(res.body.title).to.equal("AMERICAN HUSTLE");
          expect(res.body.idIMDB).to.equal("tt1800241");
          expect(res.body.bechdelResults.pass).to.equal(true);
          expect(res.body.bechdelResults.bechdelScore).to.equal(3);
          expect(res.body.bechdelResults.numScenesPass).to.equal(14);
          expect(res.body.bechdelResults.numScenesDontPass).to.equal(171);
          expect(res.body.bechdelResults.numOfFemalesChars).to.equal(3);
          expect(res.body.bechdelResults.numOfMaleChars).to.equal(12);
          expect(
            res.body.bechdelResults.numOfFemalesCharsWithDialogue
          ).to.equal(3);
          expect(res.body.bechdelResults.numOfMaleCharsWithDialogue).to.equal(
            9
          );
          expect(res.body.bechdelResults.totalLinesFemaleDialogue).to.equal(
            205
          );
          expect(res.body.bechdelResults.totalLinesMaleDialogue).to.equal(798);
          expect(res.body.images.backdrop).to.equal(
            "https://image.tmdb.org/t/p/w1000/dpGGeiTPDzqrcbK7h8if2YHHBXN.jpg"
          );
          expect(res.body.images.poster).to.equal(
            "https://image.tmdb.org/t/p/w300/mhB7C62lSMpGO2HYNaW6d7W3TVH.jpg"
          );
          const actors = res.body.actors;
          expect(actors).to.be.an("array");
          expect(actors).to.have.length.above(1);
          for (let i = 0; i < actors; i++) {
            expect(actors[i].actorActress).to.be.ok;
            expect(actors[i].actorActress).to.be.an("string");
            expect(actors[i].character).to.be.ok;
            expect(actors[i].character).to.be.an("string");
            expect(actors[i].actorName).to.be.ok;
            expect(actors[i].actorName).to.be.an("string");
          }
          const genres = res.body.genres;
          expect(genres).to.be.an("array");
          expect(genres).to.have.length.above(0);
          for (let i = 0; i < genres; i++) {
            expect(genres[i]).to.be.ok;
            expect(genres[i]).to.be.a("string");
          }
          const writers = res.body.writers;
          expect(writers).to.be.an("array");
          expect(writers).to.have.length.above(0);
          for (let i = 0; i < writers; i++) {
            expect(writers[i].id).to.be.ok;
            expect(writers[i].name).to.be.ok;
            expect(writers[i].name).to.be.an("string");
          }
          const directors = res.body.directors;
          expect(directors).to.be.an("array");
          expect(directors).to.have.length.above(0);
          for (let i = 0; i < directors; i++) {
            expect(directors[i].id).to.be.ok;
            expect(directors[i].name).to.be.ok;
            expect(directors[i].name).to.be.an("string");
          }
          return done();
        });
    });
  });

  describe("POST /api/film/", () => {
    it("should return a new film in the database", function(done) {
      this.timeout(0);
      request(app)
        .post("/api/film/")
        .attach("script", path.join(__dirname, "test-script.txt"))
        .expect(200)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.be.an("object");
          expect(res.body).to.include.keys("title");
          expect(res.body.title).to.equal("BOYHOOD");
          expect(res.body.idIMDB).to.equal("tt1065073");
          expect(res.body.rated).to.equal("R");
          expect(res.body.releaseDate).to.equal("20140815");
          expect(res.body.bechdelResults.pass).to.equal(true);
          expect(res.body.bechdelResults.bechdelScore).to.equal(3);
          expect(res.body.bechdelResults.numScenesPass).to.equal(33);
          expect(res.body.bechdelResults.numScenesDontPass).to.equal(313);
          expect(res.body.bechdelResults.numOfFemalesChars).to.equal(10);
          expect(res.body.bechdelResults.numOfMaleChars).to.equal(20);
          expect(
            res.body.bechdelResults.numOfFemalesCharsWithDialogue
          ).to.equal(8);
          expect(res.body.bechdelResults.numOfMaleCharsWithDialogue).to.equal(
            15
          );
          expect(res.body.bechdelResults.totalLinesFemaleDialogue).to.equal(
            782
          );
          expect(res.body.bechdelResults.totalLinesMaleDialogue).to.equal(1670);
          expect(res.body.images.backdrop).to.not.be.empty;
          expect(res.body.images.poster).to.not.be.empty;
          const actors = res.body.actors;
          expect(actors).to.be.an("array");
          expect(actors).to.have.length.above(1);
          for (let i = 0; i < actors; i++) {
            expect(actors[i].actorActress).to.be.ok;
            expect(actors[i].actorActress).to.be.an("string");
            expect(actors[i].character).to.be.ok;
            expect(actors[i].character).to.be.an("string");
            expect(actors[i].actorName).to.be.ok;
            expect(actors[i].actorName).to.be.an("string");
          }
          const genres = res.body.genres;
          expect(genres).to.be.an("array");
          expect(genres).to.have.length.above(0);
          for (let i = 0; i < genres; i++) {
            expect(genres[i]).to.be.ok;
            expect(genres[i]).to.be.a("string");
          }
          const writers = res.body.writers;
          expect(writers).to.be.an("array");
          expect(writers).to.have.length.above(0);
          for (let i = 0; i < writers; i++) {
            expect(writers[i].id).to.be.ok;
            expect(writers[i].name).to.be.ok;
            expect(writers[i].name).to.be.an("string");
          }
          const directors = res.body.directors;
          expect(directors).to.be.an("array");
          expect(directors).to.have.length.above(0);
          for (let i = 0; i < directors; i++) {
            expect(directors[i].id).to.be.ok;
            expect(directors[i].name).to.be.ok;
            expect(directors[i].name).to.be.an("string");
          }
          return done();
        });
    });
  });

  describe("GET /api/film/:id", () => {
    it("should send JSON with a single film", done => {
      request(app)
        .get(`/api/film/${id}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.be.an("object");
          expect(res.body).to.include.keys("title");
          expect(res.body.title).to.equal("AMERICAN HUSTLE");
          expect(res.body.idIMDB).to.equal("tt1800241");
          return done();
        });
    });
  });

  describe("DELETE /api/film/:id", () => {
    it("should return success:true after deleting movie from the database", done => {
      request(app)
        .del(`/api/film/${id}`)
        .expect(200)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.be.an("object");
          return done();
        });
    });
    it("The movie should be removed from the database", done => {
      request(app)
        .get(`/api/film/${id}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response.body).to.be.empty;
          return done();
        });
    });
  });
});
