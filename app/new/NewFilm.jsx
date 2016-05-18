/* jshint esversion: 6 */
// https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
// https://stackoverflow.com/questions/4856917/jquery-upload-progress-and-ajax-file-upload#494377
'use strict';

import React from 'react';
import styles from './NewFilm.scss';
import * as $ from'jquery';

export default React.createClass({
  getInitialState() {
    return {
      film: '',
      fileName: '',
      blob: ''
    }
  },
  handleFilmSubmit(e) {
    e.preventDefault();
    let fd = new FormData(document.querySelector("form"));
    $.ajax({
      url: "/api/film",
      method: 'POST',
      data: fd,
      cache: false,
      processData: false,
      contentType: false,
      success: function(data) {
        console.log(data, 'SUCCESS');
        window.location = '/film/' + data[0]._id;
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },
  handleScriptUploadChange(e){
    var reader = new FileReader();
    var file = e.target.files[0];

    reader.onload = (upload) => {
      this.setState({blob: upload.target.result, fileName: file.name});
    }

    if(file){
      reader.readAsDataURL(file);

    }
  },
  render() {
    return (
      <div>
        <div>New Film</div>
        <form
          name="script"
          action="/api/film"
          encType="multipart/form-data"
          method="POST"
        >
          <p>Please specify a file, or a set of files:<br /></p>
          <input
            type="file"
            name="script"
            size="40"
            onChange={this.handleScriptUploadChange}
          />
          <div>
            <button onClick={this.handleFilmSubmit}>Submit Script</button>
          </div>
        </form>
      </div>
    )
  }
});