import React from 'react';
import Uploader from './Uploader/Uploader';
import api from '../../helper/api';
import Loading from '../../shared/Loading/Loading';

class NewFilm extends React.Component {
	constructor() {
		super();
		this.state = {
			isLoading: false,
		};
		this.handleFilmSubmit = this.handleFilmSubmit.bind(this);
		this.postFilm = this.postFilm.bind(this);
	}

	postFilm() {
		const formData = new FormData(document.querySelector('form'));
		const url = '/api/film';
		const options = {
			method: 'POST',
			body: formData,
		};

		api(url, options).then(response => {
			this.setState({ isLoading: false });
			window.location = `/film/${response._id}`;
		});
	}

	handleFilmSubmit(e) {
		e.preventDefault();
		this.setState({ isLoading: true });
		this.postFilm();
	}

	render() {
		return (
			<div className="newFilm">
				{this.state.isLoading ? (
					<Loading />
				) : (
					<div>
						<h1>test a new script</h1>
						<Uploader />
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
					</div>
				)}
			</div>
		);
	}
}

NewFilm.propTypes = {};

NewFilm.defaultProps = {};

export default NewFilm;
