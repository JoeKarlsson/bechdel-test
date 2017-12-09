import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.jsx";
import About from "./static/about/About.jsx";
import CaseStudy from "./static/caseStudy/CaseStudy.jsx";
import Films from "./films/films/Films.jsx";
import Film from "./films/film/Film.jsx";
import NewFilm from "./films/new/NewFilm.jsx";
import NoMatch from "./shared/NoMatch.jsx";
import ErrorBoundary from "./shared/ErrorBoundary/ErrorBoundary";

ReactDOM.render(
  <ErrorBoundary>
    <Router>
      <App />
    </Router>
  </ErrorBoundary>,
  document.getElementById("root")
);
