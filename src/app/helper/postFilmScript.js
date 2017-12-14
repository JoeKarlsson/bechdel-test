import * as $ from 'jquery';

const handleFilmSubmit = (formData) => {
	$.ajax({
		url: '/api/film',
		method: 'POST',
		data: formData,
		cache: false,
		processData: false,
		contentType: false,
		success: (data) => {
			console.log(data, 'SUCCESS');
			window.location = `/film/${data._id}`;
		},
		error: (xhr, status, err) => {
			console.error(status, err.toString());
			return err.toString();
		},
	});
};

export default handleFilmSubmit;
