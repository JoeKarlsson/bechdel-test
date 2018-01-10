import React from 'react';
import api from '../../../helper/api';
import Loading from '../../../shared/Loading/Loading';

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
			<div className="uloaderOld">
				{this.state.isLoading ? (
					<Loading />
				) : (
					<form
						name="script"
						action="/api/film"
						encType="multipart/form-data"
						method="POST"
					>
						<input type="file" name="script" size="40" />
						<div>
							<button onClick={this.handleFilmSubmit}>Submit Script</button>
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
