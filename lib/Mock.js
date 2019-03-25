class Mock {
    constructor({ feature, url, request, response, delay = 0 }) {
        this._feature = feature;
        this._url = url;
        this._request = request;
        this._response = response;
        this._delay = delay;
    }

    get feature() {
        return this._feature;
    }

    get url() {
        return this._url;
    }

    get method() {
        return this._request.method;
    }

    get response() {
        return this._response;
    }

    get delay() {
        return this._delay;
    }
}

module.exports = Feature;