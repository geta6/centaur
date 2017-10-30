import noop from 'lodash/noop';
import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import PureComponent from 'react-immutable-pure-component';
import style from './Button.styl';
import { withStyles } from '../../utils/Decorator';

@withStyles(style)
export default class Button extends PureComponent {

  static displayName = 'ButtonComponent';

  static propTypes = {
    // type: PropTypes.oneOf(['default']).isRequired,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    onClick: PropTypes.func,
    children: PropTypes.node.isRequired,
  };

  static defaultProps = {
    size: null,
    onClick: noop,
  };

  render = () => {
    const { size, onClick, children } = this.props;
    return (
      <a className={classNames(style.root, style[`size-${size}`])} onClick={onClick}>
        {children}
      </a>
    );
  }

}
