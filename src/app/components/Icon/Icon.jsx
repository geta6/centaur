import feather from 'feather-icons';
import React from 'react';
import PropTypes from 'prop-types';
import PureComponent from 'react-immutable-pure-component';
import style from './Icon.styl';
import { withStyles } from '../../utils/Decorator';

@withStyles(style)
export default class Icon extends PureComponent {

  static displayName = 'IconComponent';

  static propTypes = {
    src: PropTypes.oneOf(Object.keys(feather.icons)).isRequired,
    size: PropTypes.number,
  };

  static defaultProps = {
    size: 24,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      svg: feather.toSvg(props.src, {
        width: props.size,
        height: props.size,
      }),
    };
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      svg: feather.toSvg(nextProps.src, {
        width: nextProps.size,
        height: nextProps.size,
      }),
    });
  };

  render = () => (
    <i
      className={style.root}
      dangerouslySetInnerHTML={{ __html: this.state.svg }}
    />
  );

}
