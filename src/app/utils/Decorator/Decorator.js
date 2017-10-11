import React from 'react';
import PropTypes from 'prop-types';
import PureComponent from 'react-immutable-pure-component';

export const withStyles = (...styles) => (ComposedComponent) => (
  class WithStyles extends PureComponent {

    static displayName = `withStyles(${ComposedComponent.displayName})`;

    static contextTypes = {
      useCss: PropTypes.func.isRequired,
    };

    componentWillMount = () => {
      this.removes = styles.map((style) => this.context.useCss(style));
    };

    componentWillUnmount = () => {
      setTimeout(() => this.removes.forEach((remove) => remove()), 0);
    };

    render = () => React.createElement(ComposedComponent, this.props);

  }
);
