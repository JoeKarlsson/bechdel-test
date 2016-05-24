import React from 'react';
import NavLink from './shared/navigation/NavLink.jsx';
import Home from './home/Home.jsx';
import About from './static/about/About.jsx';
import Films from './films/films/Films.jsx';
import styles from './App.scss';

class App extends React.Component {
  render() {
    return (
      <div className={styles.site}>
        <header>
          <NavLink to='/' onlyActiveOnIndex={true} className={styles.header_logo}>Bechdel Test</NavLink>
          <ul className={styles.header_nav}>
            <li><NavLink to='/' onlyActiveOnIndex={true}>Home</NavLink></li>
            <li><NavLink to='/about'>About</NavLink></li>
          </ul>
        </header>

        <div className='container content'>
          {
              this.props.children || <Home/>
          }
        </div>

        <footer className={styles.footer}>
          <div className={styles.footer_content}>
            <a href='http://www.callmejoe.net/'><p>Site by Joe.</p></a>
          </div>
        </footer>
      </div>
    );
  }
}

export default App;
