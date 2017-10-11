import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { provideContext } from 'fluxible-addons-react';

@provideContext({ useCss: PropTypes.func.isRequired })
export default class Html extends PureComponent {

  static propTypes = {
    style: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    assets: PropTypes.object.isRequired,
    children: PropTypes.node,
  };

  static defaultProps = {
    children: undefined,
  };

  render = () => (
    <html lang='ja'>
      <head data-prefix='og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# article: http://ogp.me/ns/article#'>
        <title>タイトル</title>
        <meta charSet='utf-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='viewport' content='width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0' />
        <style id='css' dangerouslySetInnerHTML={{ __html: this.props.style }} />
        <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Asap:400,700' />
      </head>
      <body>
        <div id='root' dangerouslySetInnerHTML={{ __html: this.props.children }} />
        <script id='state' dangerouslySetInnerHTML={{ __html: this.props.state }} />
        <script src={process.env.ACCOUNT_SOURCE} async defer />
        {this.props.assets.vendor && <script id='vendor' src={this.props.assets.vendor.js} />}
        {this.props.assets.client && <script id='client' src={this.props.assets.client.js} async defer />}
      </body>
    </html>
  );

}
