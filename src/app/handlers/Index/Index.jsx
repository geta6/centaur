import React from 'react';
import PureComponent from 'react-immutable-pure-component';
import style from './Index.styl';
import Icon from '../../components/Icon';
import { withStyles } from '../../utils/Decorator';

@withStyles(style)
export default class Index extends PureComponent {

  static displayName = 'Index';

  render = () => (
    <div id={style.root}>
      <p>IndexPage</p>
      <h1>Icon Example</h1>

      <p>Home: <Icon src='home' /></p>
    </div>
  );

}
