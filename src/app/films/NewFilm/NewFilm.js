import React from 'react';
import postFilmScript from '../../helper/postFilmScript';
import Loading from '../../shared/Loading/Loading';

class NewFilm extends React.Component {
	constructor() {
		super();
		this.state = {
			film: '',
			fileName: '',
			blob: '',
			isLoading: false,
		};
		this.handleScriptUploadChange = this.handleScriptUploadChange.bind(this);
		this.handleFilmSubmit = this.handleFilmSubmit.bind(this);
	}

	handleFilmSubmit(e) {
		e.preventDefault();
		this.setState({ isLoading: true });
		const fd = new FormData(document.querySelector('form'));
		postFilmScript(fd);
	}

	handleScriptUploadChange(e) {
		const reader = new FileReader();
		const file = e.target.files[0];

		reader.onload = (upload) => {
			this.setState({
				blob: upload.target.result,
				fileName: file.name,
			});
		};

		if (file) {
			reader.readAsDataURL(file);
		}
	}

	render() {
		return (
			<div className="newFilm">
				<h1>test a new script</h1>
				{this.state.isLoading ? (
					<Loading />
				) : (
					<form
						name="script"
						action="/api/film"
						encType="multipart/form-data"
						method="POST"
					>
						<p>
						Note: This tool currently only suppports scripts with a .txt
						format, and the script must follow the{' '}
							<a
								target="blank"
								href="http://www.simplyscripts.com/WR_format.html"
							>
							Standard Script Format
							</a>.
						</p>
						<p>
						If you are still having issues using the tool, try adding the
						title of the script is on the first line. Or you can submit an{' '}
							<a
								target="blank"
								href="https://github.com/JoeKarlsson1/bechdel-test/issues"
							>
							issue
							</a>.
						</p>
						<p>
						You can check out a example script{' '}
							<a
								target="blank"
								href="https://github.com/JoeKarlsson1/bechdel-test/blob/master/tests/server/methods/test-script.txt"
							>
							here
							</a>.
						</p>
						<p>
						Please specify a file, or a set of files:<br />
						</p>
						<input
							type="file"
							name="script"
							size="40"
							onChange={this.handleScriptUploadChange}
						/>
						<div>
							<button onClick={this.handleFilmSubmit}>
								Submit Script
							</button>
						</div>
					</form>
				)}
			</div>
		);
	}
}

NewFilm.propTypes = {};

NewFilm.defaultProps = {};

export default NewFilm;
