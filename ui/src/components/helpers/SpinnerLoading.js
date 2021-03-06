import React from 'react';


/**
 * SpinnerLoading component which represents the App logo
 * spinning when a a page is loading.
 */
const SpinnerLoading = props => {
	return (
		<div className="loading-div">
			<div className='spinner-div' >
				<img src={'/assets/logo.svg'} alt="Loading game..." />
			</div>
		</div>
	)
}

export default SpinnerLoading