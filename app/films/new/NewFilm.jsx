import React from 'react';
import { Link } from 'react-router';
import styles from './NewFilm.scss';
import * as $ from'jquery';
import Loading from '../../shared/loading/Loading.jsx'

class NewFilm extends React.Component {
  constructor() {
    super();
    this.state = {
      film: '',
      fileName: '',
      blob: '',
      isLoading: false,
    };
    this.handleScriptUploadChange = this.handleScriptUploadChange.bind(this)
    this.handleFilmSubmit = this.handleFilmSubmit.bind(this)
  }

  handleFilmSubmit(e) {
    e.preventDefault();
    this.setState({ isLoading: true });
    let fd = new FormData(document.querySelector('form'));
    $.ajax({
      url: '/api/film',
      method: 'POST',
      data: fd,
      cache: false,
      processData: false,
      contentType: false,
      success: function(data) {
        console.log(data, 'SUCCESS');
        window.location = '/film/' + data._id;
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({ loading: false });
        console.error(status, err.toString());
      }.bind(this)
    });
  }

  handleScriptUploadChange(e){
    var reader = new FileReader();
    var file = e.target.files[0];

    reader.onload = (upload) => {
      this.setState({
        blob: upload.target.result,
        fileName: file.name,
      });
    }

    if(file){
      reader.readAsDataURL(file);

    }
  }

  render() {
    return (
      <div className={styles.newFilm}>
        <h1>test a new script</h1>
        {
          this.state.isLoading ?
          <Loading />
        :
          <form
            name='script'
            action='/api/film'
            encType='multipart/form-data'
            method='POST'
          >
            <p>
              Note: This tool currently only suppports scripts with a .txt format, and the script must follow the <a target="blank" href='http://www.simplyscripts.com/WR_format.html'>Standard Script Format</a>.
            </p>
            <p>
              If you are still having issues using the tool, try adding the title of the script is on the first line. Or you can submit an <a target="blank" href="https://github.com/JoeKarlsson1/bechdel-test/issues">issue</a>.
            </p>
            <p>
              You can check out a example script <a target="blank" href='https://github.com/JoeKarlsson1/bechdel-test/blob/master/tests/server/methods/test-script.txt'>here</a>.
            </p>
            <p>
              Please specify a file, or a set of files:<br />
            </p>
            <input
              type='file'
              name='script'
              size='40'
              onChange={this.handleScriptUploadChange}
            />
            <div>
              <button onClick={this.handleFilmSubmit}>Submit Script</button>
            </div>
          </form>
        }
      </div>
    )
  }
}

NewFilm.propTypes = {
  film: React.PropTypes.string,
  fileName: React.PropTypes.string,
  blob: React.PropTypes.string,
};

NewFilm.defaultProps = {
  film: '',
  fileName: '',
  blob: '',
  isLoading: false,
};

export default NewFilm;
