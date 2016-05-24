import React from 'react';

class About extends React.Component {
  render() {
    return (
      <div>
        <h3>about</h3>
        <p>
          The Bechdel Test, sometimes called the Mo Movie Measure or Bechdel Rule
          is a simple test which names the following three criteria:
        </p>
        <p>1) It includes at least two women</p>
        <p>2) who have at least one conversation</p>
        <p>3) about something other than a man or men.</p>
        <p>
          This was a collaborative project between a English Scholar and a software
          engineer. With the tool we’ve created, the process of determing whether a film
          passes the Beschdel Test is automated, which allows massive amounts of data to
          be generated with ease. Thus, data can be produced for large bodies of film, i.e.
          a certain director’s filmography, a certain actress’ body of work, or for
          the films released in a specific year.
        </p>
        <p>
          In order to test effectivness of this tool, we have selected and analyzed
          the 2014 Oscars Best Picture Nominees. The data below shows congregate
          data form all of the nominees, and additional data about each film.
        </p>

      </div>
    );
  }
}

export default About;
