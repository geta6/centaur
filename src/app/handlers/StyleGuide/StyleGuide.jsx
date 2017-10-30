import React from 'react';
import PureComponent from 'react-immutable-pure-component';
import style from './StyleGuide.styl';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { withStyles } from '../../utils/Decorator';

@withStyles(style)
export default class StyleGuide extends PureComponent {

  static displayName = 'StyleGuideContainer';

  render = () => (
    <div id={style.root}>
      <p>StyleGuide</p>
      <h1>Icon</h1>

      <p>Home: <Icon src='home' /></p>

      <h1>Button</h1>

      <h2>Sizes</h2>
      <Button size='small'>Small</Button>
      <Button>Normal</Button>
      <Button size='medium'>Medium</Button>
      <Button size='large'>Large</Button>
    </div>
  );

}
