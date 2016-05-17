/* jshint esversion: 6 */
'use strict';

import React from 'react';
import { Link } from 'react-router';
import NewFile from './NewFile.jsx';
import styles from './Home.scss';

export default React.createClass({
  getInitialState() {
    let filename = 'newFile'+ Math.floor(Math.random()*100) + '.txt';
    return {
      description: 'The description for this gist',
      files: [{
        filename: filename,
        originalFileName: filename,
        content: 'Add your content here'
      }]
    }
  },
  handleAddFile(e) {
    e.preventDefault();
    let newFile = {};
    let fileName = 'newFile'+ Math.floor(Math.random()*100) + '.txt';
    newFile.filename = fileName;
    newFile.originalFileName = fileName;
    newFile.content = 'Add your content here';
    this.state.files.push(newFile);
    this.setState({files: this.state.files});
  },
  handleDescriptionChange(e) {
    this.setState({ description: e.target.value });
  },
  handleFileNameChange(newFileName, originalFileName) {
    for (var i = this.state.files.length - 1; i >= 0; i--) {
      if (this.state.files[i].originalFileName === originalFileName) {
        this.state.files[i].filename = newFileName;
      }
    }
  },
  handleContentChange(content, filename) {
    for (var i = this.state.files.length - 1; i >= 0; i--) {
      if (this.state.files[i].filename === filename) {
        this.state.files[i].content = content;
      }
    }
  },
  handleFileDelete(filename) {
    let updatedFiles = this.state.files;
    for (var i = updatedFiles.length - 1; i >= 0; i--) {
      if (updatedFiles[i].filename === filename) {
        updatedFiles.splice(i, 1);
      }
    }
    this.setState({files: updatedFiles});
  },

  render() {
    const newFileNode = this.state.files.map(function(fileData) {
      return (
        <NewFile
          file={fileData}
          onFileNameChange={this.handleFileNameChange}
          onContentChange={this.handleContentChange}
          onFileDelete={this.handleFileDelete}
          key={fileData.filename + Math.random()*100000}
        />
      )
    }.bind(this));
    return (
      <div>
        <div className="section header">
          <div className="container">
            <h2 className="section-heading">Instantly share code, notes, and snippets.</h2>
            <Link to={'/login'}><button className="button button-primary">Let's get started</button></Link>
          </div>
        </div>

        <div className="new-btns">
          <div className="cancel-add-file-btns">
            <button onClick={this.handleAddFile}>Add File</button>
          </div>
          <div className="create-public-private-btns">
            <Link to={'/login'}><button>Create Public Gist</button></Link>
            <Link to={'/login'}><button>Create Private Gist</button></Link>
          </div>
        </div>
        <form>
          <label for="description">Description</label>
          <input
            ref="description"
            type='text'
            id='description'
            className="u-full-width"
            placeholder={this.state.description}
            value={this.state.description}
            defaultValue={this.state.description}
            onChange={this.handleDescriptionChange}
          />

          { newFileNode }

          <div className="new-btns">
            <div className="cancel-add-file-btns">
              <button onClick={this.handleAddFile}>Add File</button>
            </div>
            <div className="create-public-private-btns">
              <Link to={'/login'}><button>Create Public Gist</button></Link>
              <Link to={'/login'}><button>Create Private Gist</button></Link>
            </div>
          </div>
        </form>
      </div>
    )
  }
});