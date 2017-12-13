import React from 'react';
import styles from './Loading.scss';

const Loading = () => (
	<div>
		<span className={styles.Loader}>
			<div className={styles.Loader_indicator} >
				<h1>
					<span>Destroying the Patriarchy</span>
					<span className={styles.Loader_ellipsis} >
						<span className={styles.Loader_ellipsisDot}>.</span>
						<span className={styles.Loader_ellipsisDot}>.</span>
						<span className={styles.Loader_ellipsisDot}>.</span>
					</span>
				</h1>
			</div>
		</span>
	</div>
);

export default Loading;
