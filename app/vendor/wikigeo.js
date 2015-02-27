// Generated by CoffeeScript 1.6.2
/*

geojson takes a geo coordinate (longitude, latitude) and a callback that will 
be given geojson for Wikipedia articles that are relevant for that location

options:
  radius: search radius in meters (default: 1000, max: 10000)
  limit: the number of wikipedia articles to limit to (default: 10, max: 500)
  images: set to true to get filename images for the article
  summaries: set to true to get short text summaries for the article
  templates: set to true to get a list of templates used in the article
  categories: set to true to get a list of categories the article is in

example:
  geojson([-77.0155, 39.0114], {radius: 5000}, function(data) {
    console.log(data);
  })
*/


(function() {
  var error, fetch, geojson, request, root, _browserFetch, _clean, _convert, _fetch, _search,
    _this = this;

  geojson = function(geo, opts, callback) {
    if (opts == null) {
      opts = {};
    }
    if (typeof opts === "function") {
      callback = opts;
      opts = {};
    }
    if (!opts.limit) {
      opts.limit = 10;
    }
    if (!opts.radius) {
      opts.radius = 10000;
    }
    if (!opts.language) {
      opts.language = "en";
    }
    if (opts.radius > 10000) {
      throw new Error("radius cannot be greater than 10000");
    }
    if (opts.limit > 500) {
      throw new Error("limit cannot be greater than 500");
    }
    return _search(geo, opts, callback);
  };

  _search = function(geo, opts, callback, results, queryContinue) {
    var continueParams, name, param, q, url;

    url = "http://" + opts.language + ".wikipedia.org/w/api.php";
    q = {
      action: "query",
      prop: "info|coordinates",
      generator: "geosearch",
      ggsradius: opts.radius,
      ggscoord: "" + geo[1] + "|" + geo[0],
      ggslimit: opts.limit,
      format: "json"
    };
    if (opts.images) {
      q.prop += "|pageprops";
    }
    if (opts.summaries) {
      q.prop += "|extracts";
      q.exlimit = "max";
      q.exintro = 1;
      q.explaintext = 1;
    }
    if (opts.templates) {
      q.prop += "|templates";
      q.tllimit = 500;
    }
    if (opts.categories) {
      q.prop += "|categories";
      q.cllimit = 500;
    }
    continueParams = {
      extracts: "excontinue",
      coordinates: "cocontinue",
      templates: "tlcontinue",
      categories: "clcontinue"
    };
    if (queryContinue) {
      for (name in continueParams) {
        param = continueParams[name];
        if (queryContinue[name]) {
          q[param] = queryContinue[name][param];
        }
      }
    }
    console.log("fetching results from wikipedia api");
    return fetch(url, {
      params: q
    }, function(response) {
      var article, articleId, first, newValues, prop, resultsArticle, _ref;

      if (!results) {
        first = true;
        results = response;
      }
      ({
        "else": first = false
      });
      if (!(response.query && response.query.pages)) {
        _convert(results, opts, callback);
        return;
      }
      _ref = response.query.pages;
      for (articleId in _ref) {
        article = _ref[articleId];
        resultsArticle = results.query.pages[articleId];
        if (!resultsArticle) {
          continue;
        }
        for (prop in continueParams) {
          param = continueParams[prop];
          if (prop === 'extracts') {
            prop = 'extract';
          }
          newValues = article[prop];
          if (!newValues) {
            continue;
          }
          if (Array.isArray(newValues)) {
            if (!resultsArticle[prop]) {
              resultsArticle[prop] = newValues;
            } else if (!first && resultsArticle[prop][-1] !== newValues[-1]) {
              resultsArticle[prop] = resultsArticle[prop].concat(newValues);
            }
          } else {
            resultsArticle[prop] = article[prop];
          }
        }
      }
      if (response['query-continue']) {
        if (!queryContinue) {
          queryContinue = response['query-continue'];
        } else {
          for (name in continueParams) {
            param = continueParams[name];
            if (response['query-continue'][name]) {
              queryContinue[name] = response['query-continue'][name];
            }
          }
        }
        return _search(geo, opts, callback, results, queryContinue);
      } else {
        return _convert(results, opts, callback);
      }
    });
  };

  _convert = function(results, opts, callback) {
    var article, articleId, feature, geo, image, titleEscaped, url, _ref;

    geo = {
      type: "FeatureCollection",
      features: []
    };
    if (!(results && results.query && results.query.pages)) {
      callback(geo);
      return;
    }
    _ref = results.query.pages;
    for (articleId in _ref) {
      article = _ref[articleId];
      if (!article.coordinates) {
        continue;
      }
      titleEscaped = article.title.replace(/\s/g, "_");
      url = "http://" + opts.language + ".wikipedia.org/wiki/" + titleEscaped;
      feature = {
        id: url,
        type: "Feature",
        properties: {
          name: article.title
        },
        geometry: {
          type: "Point",
          coordinates: [Number(article.coordinates[0].lon), Number(article.coordinates[0].lat)]
        }
      };
      if (opts.images) {
        if (article.pageprops) {
          image = article.pageprops.page_image;
        } else {
          image = null;
        }
        feature.properties.image = image;
      }
      if (opts.templates) {
        feature.properties.templates = _clean(article.templates);
      }
      if (opts.summaries) {
        feature.properties.summary = article.extract;
      }
      if (opts.categories) {
        feature.properties.categories = _clean(article.categories);
      }
      geo.features.push(feature);
    }
    callback(geo);
  };

  _clean = function(list) {
    var i;

    return (function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        i = list[_i];
        _results.push(i.title.replace(/^.+?:/, ''));
      }
      return _results;
    })();
  };

  _fetch = function(uri, opts, callback) {
    return request(uri, {
      qs: opts.params,
      json: true
    }, function(e, r, data) {
      return callback(data);
    });
  };

  _browserFetch = function(uri, opts, callback) {
    return $.ajax({
      url: uri,
      data: opts.params,
      dataType: "jsonp",
      success: function(response) {
        return callback(response);
      }
    });
  };

  try {
    request = require('request');
    fetch = _fetch;
  } catch (_error) {
    error = _error;
    fetch = _browserFetch;
  }

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.geojson = geojson;

}).call(this);
