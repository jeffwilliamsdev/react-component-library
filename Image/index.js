import React from 'react'
import classnames from 'classnames'
import PropTypes from 'prop-types'

export default class Image extends React.Component {
	constructor() {
		super()
		this.state = {
			imageLoaded:false,
			windowWidth: null,
			currentSrc:null
		}

		this.sizeImage = this.sizeImage.bind(this)
		this.handleImageLoad = this.handleImageLoad.bind(this)
	}

	componentDidMount() {
		const { responsive } = this.props

		this.setState({
			windowWidth: window.innerWidth
		})

		const thisImage = this.refs.image

		// if image rendered to fast from server, onload won't fire on client
		if (thisImage.complete && !this.state.imageLoaded) this.handleImageLoad()

		if (responsive) {
			window.addEventListener('resize', this.sizeImage )
		}
	}

	componentWillUnmount() {
		const { responsive } = this.props
		const { image } = this.refs

		clearTimeout(this.resizeTimer)
		image.removeEventListener('load', this.handleImageLoad)
		if (responsive) {
			window.removeEventListener('resize', this.sizeImage )
		}
	}

	handleImageLoad() {
		const { callback, responsive } = this.props

		this.setState({
			imageLoaded:true,
			currentSrc: this.refs.image.src
		}, () => {
			if (callback) {
				callback()
			}
		})

		if (responsive) {
			this.sizeImage()
		}
	}

	handleImageLoadError() {
		console.error('There was an error loading this image.')
	}

	sizeImage() {
		clearTimeout(this.resizeTimer)

		this.resizeTimer = setTimeout( ()=> {
			let changedSrc
			let { src } = this.props
			if ( window.innerWidth >= 1600) {
				changedSrc = src.sizes['full-large'].image
			}
			else if (window.innerWidth >= 800) {
				changedSrc = src.sizes.large.image
			}
			else {
				changedSrc = src.sizes.medium.image
			}

			this.setState({
				currentSrc: changedSrc
			})
		}, 1000)
	}

	render() {
		const { className, style, responsive, src, alt } = this.props
		const { imageLoaded, currentSrc } = this.state

		const imgClasses = classnames({
			'custom-image' : true,
			'fadeIn' : imageLoaded ? true : false
		})

		return(
			<div className={ className } style={ Object.assign({ width:'100%', 'position' : 'relative' }, style)}>
				{
					responsive &&
					<img className={ imgClasses }
						 ref="image"
						 src={ currentSrc ? currentSrc : src.sizes.large }
						 onLoad={ this.handleImageLoad }
						 onError={ this.handleImageLoadError.bind(this) }
						 alt={ alt } />
				}
				{
					!responsive &&
					<img className={ imgClasses }
						 ref="image"
						 src={ src }
						 onLoad={ this.handleImageLoad }
						 onError={ this.handleImageLoadError.bind(this) }
						 alt={ alt } />
				}
				<div className="loader" style ={{ 'display' : imageLoaded ? 'none' : 'block', 'zIndex': 100 }}>
					<img src="../../dist/assets/img/loader.gif" />
				</div>
			</div>
		)
	}
}

Image.propTypes = {
    src: PropTypes.string.isRequired,
    responsive: PropTypes.bool,
    callback: PropTypes.function,
    alt: PropTypes.string
}
