import React from 'react';
import NavLink from './shared/navigation/NavLink.jsx';
import skeleton from './shared/css/skeleton.css';
import normalize from './shared/css/normalize.css';
import Home from './home/Home.jsx';
import Films from './films/films/Films.jsx';
import styles from './App.scss';

class App extends React.Component {
  render() {
    return (
      <div className={styles.site}>
        <header className={styles.header_bar}>
          <NavLink to='/' onlyActiveOnIndex={true} className={styles.header_logo}>bechdel test visualizer</NavLink>
          <ul className={styles.header_nav}>
            <li><NavLink to='/about'>about</NavLink></li>
            <li><NavLink to='/case-study'>case study</NavLink></li>
          </ul>
        </header>

        <div className={styles.content}>
          <div className={skeleton.container}>
            {
                this.props.children || <Home/>
            }
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.footer_content}>
            <a href='http://www.callmejoe.net/'><p>site by joe.</p></a>
          </div>
        </footer>
      </div>
    );
  }
}

export default App;
