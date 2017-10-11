import noop from 'lodash/noop';
import React from 'react';
import PureComponent from 'react-immutable-pure-component';
import { IntlProvider } from 'react-intl';
import PropTypes from 'prop-types';
import ReactImmutablePropTypes from 'react-immutable-proptypes';
import { provideContext, connectToStores } from 'fluxible-addons-react';
import { handleHistory } from 'fluxible-router';
import style from './App.styl';
import { withStyles } from '../../utils/Decorator';

@provideContext({ useCss: PropTypes.func.isRequired })
@handleHistory()
@withStyles(require('./Global.styl'), style)
@connectToStores(['AppStore', 'RouteStore'], (context) => ({
  route: context.getStore('RouteStore').getRoute(),
  error: context.getStore('RouteStore').getError(),
  locale: context.getStore('AppStore').getLocale(),
}))
export default class App extends PureComponent {

  static displayName = 'AppContainer';

  static propTypes = {
    route: ReactImmutablePropTypes.map.isRequired,
    error: ReactImmutablePropTypes.map.isRequired,
    locale: PropTypes.string.isRequired,
  };

  static defaultProps = {
    onRenderComplete: noop,
  };

  render = () => {
    const RouteHandler = this.props.route.get('handler');
    return (
      <IntlProvider locale={this.props.locale}>
        <div id={style.root}>
          {(RouteHandler && this.props.error.isEmpty()) ? (
            <RouteHandler />
          ) : (
            <div id={style.error}>
              <p>Error: {`${+this.props.error.get('statusCode').toString().slice(0, 1)}xx`}</p>
            </div>
          )}
        </div>
      </IntlProvider>
    );
  };

}
