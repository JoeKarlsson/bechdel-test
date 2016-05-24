import React from 'react';
import { Link } from 'react-router';
import styles from './NewFilm.scss';
import * as $ from'jquery';

class NewFilm extends React.Component {
  constructor() {
    super();
    this.state = {
      film: '',
      fileName: '',
      blob: '',
    };
  }

  handleFilmSubmit(e) {
    e.preventDefault();
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
        console.error(status, err.toString());
      }.bind(this)
    });
  }

  handleScriptUploadChange(e){
    var reader = new FileReader();
    var file = e.target.files[0];

    reader.onload = (upload) => {
      this.setState({blob: upload.target.result, fileName: file.name});
    }

    if(file){
      reader.readAsDataURL(file);

    }
  }

  render() {
    return (
      <div className={styles.newFilm}>
        <div>New Film</div>
        <form
          name='script'
          action='/api/film'
          encType='multipart/form-data'
          method='POST'
        >
          <p>Please specify a file, or a set of files:<br /></p>
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
};

export default NewFilm;
