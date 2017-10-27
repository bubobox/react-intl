import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { decorate } from 'react-mixin';
import ReactPropTypes from 'prop-types';
import escape from '../escape';
import IntlMixin from '../mixin';

class FormattedHTMLMessage extends React.Component {

    static displayName = 'FormattedHTMLMessage'

    static propTypes = {
        tagName: ReactPropTypes.string,
        message: ReactPropTypes.string.isRequired
    }

    static defaultProps = {
        tagName: 'span'
    }

    render() {
        var props   = this.props;
        var tagName = props.tagName;
        var message = props.message;

        // Process all the props before they are used as values when formatting
        // the ICU Message string. Since the formatted message will be injected
        // via `innerHTML`, all String-based values need to be HTML-escaped. Any
        // React Elements that are passed as props will be rendered to a static
        // markup string that is presumed to be safe.
        var values = Object.keys(props).reduce(function (values, name) {
            var value = props[name];

            if (typeof value === 'string') {
                value = escape(value);
            } else if (React.isValidElement(value)) {
                value = ReactDOMServer.renderToStaticMarkup(value);
            }

            values[name] = value;
            return values;
        }, {});

        // Since the message presumably has HTML in it, we need to set
        // `innerHTML` in order for it to be rendered and not escaped by React.
        // To be safe, all string prop values were escaped before formatting the
        // message. It is assumed that the message is not UGC, and came from
        // the developer making it more like a template.
        //
        // Note: There's a perf impact of using this component since there's no
        // way for React to do its virtual DOM diffing.
        return (<tagName dangerouslySetInnerHTML={{
            __html: this.formatMessage(message, values)
        }} />);
    }
}

export default decorate(IntlMixin)(FormattedHTMLMessage);
