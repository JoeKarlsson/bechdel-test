import React from 'react';
import './Loading.scss';

const Loading = () => (
	<div>
		<span className="Loader">
			<div className="Loader_indicator" >
				<h1>
					<span>Destroying the Patriarchy</span>
					<span className="Loader_ellipsis" >
						<span className="Loader_ellipsisDot">.</span>
						<span className="Loader_ellipsisDot">.</span>
						<span className="Loader_ellipsisDot">.</span>
					</span>
				</h1>
			</div>
		</span>
	</div>
);

export default Loading;
