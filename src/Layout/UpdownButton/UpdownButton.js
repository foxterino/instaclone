import React from 'react'
import './Updownbutton.css'

class UpdownButton extends React.Component {
  state = {
    value: '',
    pageYLabel: 0
  };

  handleScroll() {
    const pageY = window.pageYOffset || document.documentElement.scrollTop;
    const innerHeight = document.documentElement.clientHeight;

    switch (this.state.value) {
      case '':
        if (pageY > innerHeight) {
          this.setState({ value: 'Go up' });
        }
        break;

      case 'Go up':
        if (pageY < innerHeight) {
          this.setState({ value: '' });
        }
        break;

      case 'Go down':
        if (pageY > innerHeight) {
          this.setState({ value: 'Go up' });
        }
        break;

      default:
        break;
    }
  }

  handleClick() {
    const pageY = window.pageYOffset || document.documentElement.scrollTop;

    switch (this.state.value) {
      case 'Go up':
        this.setState({
          value: 'Go down',
          pageYLabel: pageY
        });
        window.scrollTo(0, 0);
        break;

      case 'Go down':
        window.scrollTo(0, this.state.pageYLabel);
        this.setState({
          value: 'Go up',
          pageYLabel: 0
        });
        break;

      default:
        break;
    }
  }

  render() {
    window.addEventListener('scroll', () => this.handleScroll());

    if (this.state.value) {
      return (
        <div
          className='updown-button'
          onClick={() => this.handleClick()}
        >
          {this.state.value}
        </div >
      );
    }
    return null;
  }
}

export default UpdownButton;